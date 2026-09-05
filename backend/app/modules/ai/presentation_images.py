from __future__ import annotations

import asyncio
import base64
import binascii
import hashlib
import html
import logging
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import httpx
from vercel.blob import AsyncBlobClient

from app.core.config import Settings, get_settings
from app.modules.ai.schemas import GeneratedPresentationSlide, PresentationGenerationRequest

logger = logging.getLogger(__name__)

_MEDIA_DIRECTORY = Path(__file__).resolve().parents[3] / "data" / "presentation-images"
_ALLOWED_SUFFIXES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
_HTML_TAG = re.compile(r"<[^>]+>")

_STYLE_DIRECTION = {
    "infografico": "polished educational infographic look with realistic visual elements",
    "bento_pastel": "soft pastel editorial illustration with clear visual hierarchy",
    "ilustrado": "warm, expressive children's editorial illustration",
    "minimalista": "minimal photographic composition with ample negative space",
    "esquema": "clear educational diagram-like composition without labels",
    "alto_contraste": "high-contrast accessible composition with a simple focal point",
    "editorial": "premium educational magazine photography",
    "gamificado": "energetic educational game illustration with a clear focal action",
}


@dataclass(frozen=True)
class ImageCandidate:
    image_url: str
    source_url: str
    title: str
    attribution: str
    license_name: str
    width: int
    height: int
    provider: str
    rank: int


def _plain_text(value: Any) -> str:
    if isinstance(value, dict):
        value = value.get("value", "")
    return html.unescape(_HTML_TAG.sub("", str(value or ""))).strip()


def _safe_https_url(value: Any) -> str:
    text = str(value or "").strip()
    parsed = urlparse(text)
    return text if parsed.scheme == "https" and parsed.netloc else ""


def _search_tokens(value: str) -> set[str]:
    aliases = {"peruvian": "peru", "kids": "children", "child": "children"}
    ignored = {
        "and",
        "at",
        "for",
        "in",
        "of",
        "on",
        "school",
        "the",
        "with",
    }
    tokens = re.findall(r"[a-z0-9]+", value.casefold())
    return {
        aliases.get(token, token) for token in tokens if len(token) > 2 and token not in ignored
    }


def _candidate_score(candidate: ImageCandidate, query: str) -> tuple[int, int, int, int, int]:
    query_tokens = _search_tokens(query)
    candidate_tokens = _search_tokens(
        f"{candidate.title} {candidate.attribution} {candidate.source_url}"
    )
    relevance_score = len(query_tokens & candidate_tokens)
    if candidate.width and candidate.height:
        ratio = candidate.width / candidate.height
        ratio_score = max(0, 1000 - int(abs(ratio - (16 / 9)) * 350))
        size_score = min(candidate.width, 2400) + min(candidate.height, 1400)
    else:
        ratio_score = 0
        size_score = 0
    license_score = 500 if candidate.license_name else 0
    return relevance_score, max(0, 100 - candidate.rank), license_score, ratio_score, size_score


async def _search_google(
    client: httpx.AsyncClient,
    query: str,
    settings: Settings,
) -> list[ImageCandidate]:
    api_key = settings.google_custom_search_api_key
    engine_id = (settings.google_custom_search_engine_id or "").strip()
    if api_key is None or not api_key.get_secret_value().strip() or not engine_id:
        return []
    response = await client.get(
        "https://customsearch.googleapis.com/customsearch/v1",
        params={
            "key": api_key.get_secret_value(),
            "cx": engine_id,
            "q": query,
            "searchType": "image",
            "safe": "active",
            "imgSize": "xlarge",
            "rights": "cc_publicdomain|cc_attribute|cc_sharealike",
            "num": 10,
        },
    )
    response.raise_for_status()
    candidates: list[ImageCandidate] = []
    for rank, item in enumerate(response.json().get("items", [])):
        image = item.get("image") or {}
        image_url = _safe_https_url(item.get("link"))
        source_url = _safe_https_url(image.get("contextLink"))
        if not image_url:
            continue
        candidates.append(
            ImageCandidate(
                image_url=image_url,
                source_url=source_url,
                title=_plain_text(item.get("title")),
                attribution=_plain_text(item.get("displayLink")) or "Fuente localizada con Google",
                license_name="Creative Commons (resultado filtrado)",
                width=int(image.get("width") or 0),
                height=int(image.get("height") or 0),
                provider="Google Custom Search",
                rank=rank,
            )
        )
    return candidates


async def _search_wikimedia(client: httpx.AsyncClient, query: str) -> list[ImageCandidate]:
    response = await client.get(
        "https://commons.wikimedia.org/w/api.php",
        params={
            "action": "query",
            "generator": "search",
            "gsrsearch": f"filetype:bitmap {query}",
            "gsrnamespace": 6,
            "gsrlimit": 12,
            "prop": "imageinfo",
            "iiprop": "url|extmetadata|mime|size",
            "iiurlwidth": 1920,
            "format": "json",
            "origin": "*",
        },
    )
    response.raise_for_status()
    candidates: list[ImageCandidate] = []
    pages = (response.json().get("query") or {}).get("pages") or {}
    for rank, page in enumerate(pages.values()):
        info = (page.get("imageinfo") or [{}])[0]
        metadata = info.get("extmetadata") or {}
        image_url = _safe_https_url(info.get("thumburl") or info.get("url"))
        source_url = _safe_https_url(info.get("descriptionurl"))
        if not image_url:
            continue
        artist = _plain_text(metadata.get("Artist") or metadata.get("Credit"))
        candidates.append(
            ImageCandidate(
                image_url=image_url,
                source_url=source_url,
                title=_plain_text(metadata.get("ImageDescription"))
                or _plain_text(page.get("title")).removeprefix("File:"),
                attribution=artist or "Wikimedia Commons",
                license_name=_plain_text(metadata.get("LicenseShortName")) or "Ver fuente",
                width=int(info.get("thumbwidth") or info.get("width") or 0),
                height=int(info.get("thumbheight") or info.get("height") or 0),
                provider="Wikimedia Commons",
                rank=rank,
            )
        )
    return candidates


async def _search_candidates(
    client: httpx.AsyncClient,
    query: str,
    settings: Settings,
) -> list[ImageCandidate]:
    candidates: list[ImageCandidate] = []
    if settings.presentation_image_provider in {"auto", "google"}:
        try:
            candidates = await _search_google(client, query, settings)
        except (httpx.HTTPError, ValueError, TypeError):
            logger.info("Google image search was unavailable; using the licensed fallback")
    if not candidates and settings.presentation_image_provider in {"auto", "wikimedia", "google"}:
        try:
            candidates = await _search_wikimedia(client, query)
        except (httpx.HTTPError, ValueError, TypeError):
            logger.info("Wikimedia image search was unavailable")
    return sorted(candidates, key=lambda item: _candidate_score(item, query), reverse=True)


async def _download_candidate(
    client: httpx.AsyncClient,
    candidate: ImageCandidate,
) -> str | None:
    asset_id = hashlib.sha256(candidate.image_url.encode("utf-8")).hexdigest()[:40]
    for suffix in _ALLOWED_SUFFIXES.values():
        existing = _MEDIA_DIRECTORY / f"{asset_id}{suffix}"
        if existing.is_file():
            return f"/api/v1/ai/tools/presentation-images/{asset_id}"
    response = await client.get(candidate.image_url, follow_redirects=True)
    response.raise_for_status()
    content_type = response.headers.get("content-type", "").split(";", 1)[0].lower()
    suffix = _ALLOWED_SUFFIXES.get(content_type)
    if suffix is None or not response.content or len(response.content) > 10_000_000:
        return None
    if os.getenv("BLOB_READ_WRITE_TOKEN"):
        blob = await AsyncBlobClient().put(
            f"presentation-images/{asset_id}{suffix}",
            response.content,
            access="public",
            content_type=content_type,
            add_random_suffix=False,
            overwrite=True,
            cache_control_max_age=31_536_000,
        )
        return blob.url
    _MEDIA_DIRECTORY.mkdir(parents=True, exist_ok=True)
    (_MEDIA_DIRECTORY / f"{asset_id}{suffix}").write_bytes(response.content)
    return f"/api/v1/ai/tools/presentation-images/{asset_id}"


async def _generate_gemini_image(
    client: httpx.AsyncClient,
    slide: GeneratedPresentationSlide,
    payload: PresentationGenerationRequest,
    settings: Settings,
) -> dict[str, object] | None:
    api_key = settings.gemini_api_key
    if api_key is None or not api_key.get_secret_value().strip():
        return None
    composition = (
        "Place the main subject toward the right and leave calm negative space on the left."
        if slide.type in {"portada", "frase_destacada"}
        else "Use one clear focal scene that remains legible when cropped vertically on the right."
    )
    prompt = (
        "Create a high-quality 16:9 educational image for a classroom presentation. "
        f"Topic: {payload.topic}. Slide concept: {slide.title}. "
        f"Visual direction: {slide.visual_prompt}. Audience: {payload.level}, {payload.grade}, "
        f"{payload.modality}, Peru. Style: {_STYLE_DIRECTION[payload.visual_style]}. "
        f"{composition} Be culturally respectful, age-appropriate, accurate, colorful but not "
        "overloaded. Do not include words, letters, numbers, captions, logos, borders, watermarks, "
        "presentation frames, or UI elements. Use Google Search only to ground factual visual "
        "details."
    )
    asset_id = hashlib.sha256(prompt.encode("utf-8")).hexdigest()[:40]
    if any(
        (_MEDIA_DIRECTORY / f"{asset_id}{suffix}").is_file()
        for suffix in _ALLOWED_SUFFIXES.values()
    ):
        return {
            "image_url": f"/api/v1/ai/tools/presentation-images/{asset_id}",
            "image_alt": slide.visual_prompt,
            "image_attribution": "Imagen creada con Gemini · SynthID",
            "image_source_url": "",
            "image_license": "Generada con IA",
            "image_width": 1024,
            "image_height": 576,
        }
    response = await client.post(
        "https://generativelanguage.googleapis.com/v1beta/interactions",
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": api_key.get_secret_value(),
        },
        json={
            "model": settings.gemini_image_model,
            "input": [{"type": "text", "text": prompt}],
            "tools": [{"type": "google_search"}],
            "response_format": {
                "type": "image",
                "mime_type": "image/jpeg",
                "aspect_ratio": "16:9",
                "image_size": "1K",
            },
        },
    )
    response.raise_for_status()
    body = response.json()
    for step in reversed(body.get("steps") or []):
        if step.get("type") != "model_output":
            continue
        for content in step.get("content") or []:
            mime_type = str(content.get("mime_type") or "").lower()
            suffix = _ALLOWED_SUFFIXES.get(mime_type)
            encoded = content.get("data")
            if suffix is None or not isinstance(encoded, str):
                continue
            try:
                image_bytes = base64.b64decode(encoded, validate=True)
            except (ValueError, binascii.Error):
                continue
            if not image_bytes or len(image_bytes) > 12_000_000:
                continue
            if os.getenv("BLOB_READ_WRITE_TOKEN"):
                blob = await AsyncBlobClient().put(
                    f"presentation-images/{asset_id}{suffix}",
                    image_bytes,
                    access="public",
                    content_type=mime_type,
                    add_random_suffix=False,
                    overwrite=True,
                    cache_control_max_age=31_536_000,
                )
                image_url = blob.url
            else:
                _MEDIA_DIRECTORY.mkdir(parents=True, exist_ok=True)
                image_path = _MEDIA_DIRECTORY / f"{asset_id}{suffix}"
                if not image_path.exists():
                    image_path.write_bytes(image_bytes)
                image_url = f"/api/v1/ai/tools/presentation-images/{asset_id}"
            return {
                "image_url": image_url,
                "image_alt": slide.visual_prompt,
                "image_attribution": "Imagen creada con Gemini · SynthID",
                "image_source_url": "",
                "image_license": "Generada con IA",
                "image_width": 1024,
                "image_height": 576,
            }
    return None


def _image_query(
    slide: GeneratedPresentationSlide,
    payload: PresentationGenerationRequest,
) -> str:
    query = slide.image_search_query.strip()
    if query:
        return query
    return f"{payload.topic} {slide.title} {payload.level} educación Perú"


async def enrich_presentation_slides(
    slides: list[GeneratedPresentationSlide],
    payload: PresentationGenerationRequest,
) -> list[GeneratedPresentationSlide]:
    settings = get_settings()
    timeout = httpx.Timeout(settings.presentation_image_timeout_seconds)
    headers = {"User-Agent": "Avendia-Educacion/1.0 (presentaciones didacticas)"}
    google_key = settings.google_custom_search_api_key
    google_is_configured = bool(
        google_key
        and google_key.get_secret_value().strip()
        and (settings.google_custom_search_engine_id or "").strip()
    )
    try:
        async with httpx.AsyncClient(timeout=timeout, headers=headers) as client:
            use_gemini = settings.presentation_image_provider == "gemini" or (
                settings.presentation_image_provider == "auto" and not google_is_configured
            )
            gemini_results: list[dict[str, object] | None | BaseException]
            if use_gemini:
                semaphore = asyncio.Semaphore(2)

                async def generate_with_limit(
                    slide: GeneratedPresentationSlide,
                ) -> dict[str, object] | None:
                    async with semaphore:
                        return await _generate_gemini_image(client, slide, payload, settings)

                gemini_results = list(
                    await asyncio.gather(
                        *[generate_with_limit(slide) for slide in slides],
                        return_exceptions=True,
                    )
                )
                if all(isinstance(result, dict) for result in gemini_results):
                    return [
                        slide.model_copy(update=result)
                        for slide, result in zip(slides, gemini_results, strict=True)
                        if isinstance(result, dict)
                    ]
            else:
                gemini_results = [None] * len(slides)

            searches = await asyncio.gather(
                *[
                    _search_candidates(client, _image_query(slide, payload), settings)
                    for slide in slides
                ]
            )
            used_urls: set[str] = set()
            selected: list[ImageCandidate | None] = []
            for candidates in searches:
                candidate = next(
                    (
                        item
                        for item in candidates
                        if item.image_url not in used_urls
                        and _candidate_score(item, _image_query(slides[len(selected)], payload))[0]
                        > 0
                    ),
                    None,
                )
                if candidate:
                    used_urls.add(candidate.image_url)
                selected.append(candidate)
            downloads = await asyncio.gather(
                *[
                    _download_candidate(client, candidate)
                    if candidate
                    else asyncio.sleep(0, result=None)
                    for candidate in selected
                ],
                return_exceptions=True,
            )
    except (httpx.HTTPError, ValueError, OSError):
        logger.info("Presentation image enrichment was unavailable")
        return slides

    enriched: list[GeneratedPresentationSlide] = []
    for slide, gemini_result, candidate, downloaded in zip(
        slides, gemini_results, selected, downloads, strict=True
    ):
        if isinstance(gemini_result, dict):
            enriched.append(slide.model_copy(update=gemini_result))
            continue
        if candidate is None or downloaded is None or isinstance(downloaded, Exception):
            enriched.append(slide)
            continue
        credit = " · ".join(
            part
            for part in [candidate.attribution, candidate.license_name, candidate.provider]
            if part
        )
        enriched.append(
            slide.model_copy(
                update={
                    "image_url": downloaded,
                    "image_alt": candidate.title or slide.title,
                    "image_attribution": credit,
                    "image_source_url": candidate.source_url,
                    "image_license": candidate.license_name,
                    "image_width": candidate.width,
                    "image_height": candidate.height,
                }
            )
        )
    return enriched


def find_presentation_image(asset_id: str) -> Path | None:
    if not re.fullmatch(r"[a-f0-9]{40}", asset_id):
        return None
    for suffix in _ALLOWED_SUFFIXES.values():
        candidate = _MEDIA_DIRECTORY / f"{asset_id}{suffix}"
        if candidate.is_file():
            return candidate
    return None
