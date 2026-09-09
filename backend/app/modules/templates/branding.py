"""Aplica la cabecera, el pie y el logo del formato institucional a un Word generado.

El documento generado por Avendia conserva todo su contenido y estilos; del
formato de la escuela se copian, a nivel de paquete OOXML, la cabecera y el
pie por defecto de su primera sección (con sus imágenes) y la fuente base.
Si el formato no tiene pie, se conserva el pie de Avendia con la numeración.
"""

from __future__ import annotations

import posixpath
import re
import zipfile
from io import BytesIO
from xml.sax.saxutils import quoteattr

REL_HEADER = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/header"
REL_FOOTER = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer"
CT_HEADER = "application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"
CT_FOOTER = "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"
MEDIA_TYPES = {
    "png": "image/png",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "gif": "image/gif",
    "bmp": "image/bmp",
    "tiff": "image/tiff",
    "emf": "image/x-emf",
    "wmf": "image/x-wmf",
    "svg": "image/svg+xml",
}
MAX_PART_SIZE = 8 * 1024 * 1024

_RELATIONSHIP = re.compile(r"<Relationship\b([^>]*)/?>", re.S)
_ATTR = re.compile(r'(\w[\w:]*)="([^"]*)"')
_SECT_PR = re.compile(r"<w:sectPr\b[^>]*>.*?</w:sectPr>", re.S)
_REFERENCE = re.compile(r'<w:(header|footer)Reference\b[^>]*w:type="default"[^>]*/>', re.S)
_DOC_DEFAULT_FONTS = re.compile(r"<w:docDefaults>.*?<w:rFonts\b([^>]*)/>", re.S)


class BrandingError(ValueError):
    """El formato o el documento generado no tienen la estructura esperada."""


def _read_package(data: bytes) -> dict[str, bytes]:
    try:
        with zipfile.ZipFile(BytesIO(data)) as archive:
            if archive.testzip() is not None:
                raise BrandingError("El archivo está dañado")
            files = {}
            for item in archive.infolist():
                if item.file_size > MAX_PART_SIZE:
                    raise BrandingError("Una parte del archivo supera el tamaño permitido")
                files[item.filename] = archive.read(item)
            return files
    except zipfile.BadZipFile as exc:
        raise BrandingError("El archivo no es un documento Word válido") from exc


def _parse_relationships(xml: bytes | None) -> dict[str, dict[str, str]]:
    if not xml:
        return {}
    relationships: dict[str, dict[str, str]] = {}
    for match in _RELATIONSHIP.finditer(xml.decode("utf-8", errors="replace")):
        attributes = dict(_ATTR.findall(match.group(1)))
        if "Id" in attributes:
            relationships[attributes["Id"]] = attributes
    return relationships


def _default_parts(document_xml: bytes, relationships: dict[str, dict[str, str]]) -> dict[str, str]:
    """Devuelve {"header": "header1.xml", "footer": "footer1.xml"} de la primera sección."""
    sections = _SECT_PR.findall(document_xml.decode("utf-8", errors="replace"))
    if not sections:
        return {}
    parts: dict[str, str] = {}
    for reference in _REFERENCE.finditer(sections[0]):
        kind = reference.group(1)
        rel_id = re.search(r'r:id="([^"]+)"', reference.group(0))
        target = relationships.get(rel_id.group(1), {}).get("Target") if rel_id else None
        if target:
            parts[kind] = posixpath.normpath(target).lstrip("/")
    return parts


def _relationships_xml(entries: list[dict[str, str]]) -> bytes:
    body = "".join(
        "<Relationship "
        + " ".join(f"{key}={quoteattr(value)}" for key, value in entry.items())
        + "/>"
        for entry in entries
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        f"{body}</Relationships>"
    ).encode()


def _copy_part(
    kind: str,
    source_name: str,
    template: dict[str, bytes],
    generated: dict[str, bytes],
) -> str:
    """Copia la parte y sus dependencias al documento generado; devuelve su nombre."""
    part_path = f"word/{source_name}"
    if part_path not in template:
        raise BrandingError(f"El formato no contiene su {kind}")
    target_name = f"{kind}_institucional.xml"
    generated[f"word/{target_name}"] = template[part_path]

    rels_path = f"word/_rels/{source_name}.rels"
    entries: list[dict[str, str]] = []
    for rel_id, attributes in _parse_relationships(template.get(rels_path)).items():
        entry = dict(attributes)
        if attributes.get("TargetMode") == "External":
            entries.append(entry)
            continue
        source = posixpath.normpath(posixpath.join("word", attributes.get("Target", "")))
        if source not in template:
            continue
        base = posixpath.basename(source)
        extension = base.rsplit(".", 1)[-1].lower() if "." in base else ""
        new_target = (
            f"media/institucional_{kind}_{rel_id}.{extension}"
            if extension
            else f"media/institucional_{kind}_{rel_id}"
        )
        generated[f"word/{new_target}"] = template[source]
        entry["Target"] = new_target
        entries.append(entry)
    if entries:
        generated[f"word/_rels/{target_name}.rels"] = _relationships_xml(entries)
    return target_name


def _add_document_relationship(
    generated: dict[str, bytes], rel_id: str, rel_type: str, target: str
) -> None:
    rels_path = "word/_rels/document.xml.rels"
    xml = generated.get(rels_path, b"").decode("utf-8", errors="replace")
    if not xml:
        raise BrandingError("El documento generado no tiene relaciones")
    xml = re.sub(rf'<Relationship\b[^>]*Id="{re.escape(rel_id)}"[^>]*/>', "", xml)
    entry = f'<Relationship Id="{rel_id}" Type="{rel_type}" Target="{target}"/>'
    generated[rels_path] = xml.replace("</Relationships>", f"{entry}</Relationships>").encode(
        "utf-8"
    )


def _rewrite_section_references(document_xml: bytes, kinds: dict[str, str]) -> bytes:
    text = document_xml.decode("utf-8", errors="replace")

    def rewrite(match: re.Match[str]) -> str:
        section = match.group(0)
        for kind, rel_id in kinds.items():
            section = re.sub(rf'<w:{kind}Reference\b[^>]*w:type="default"[^>]*/>', "", section)
            opening_end = section.index(">") + 1
            reference = f'<w:{kind}Reference w:type="default" r:id="{rel_id}"/>'
            section = section[:opening_end] + reference + section[opening_end:]
        return section

    return _SECT_PR.sub(rewrite, text).encode("utf-8")


def _ensure_content_types(generated: dict[str, bytes], overrides: dict[str, str]) -> None:
    path = "[Content_Types].xml"
    xml = generated.get(path, b"").decode("utf-8", errors="replace")
    if not xml:
        raise BrandingError("El documento generado no declara tipos de contenido")
    for part, content_type in overrides.items():
        xml = re.sub(rf'<Override\b[^>]*PartName="{re.escape(part)}"[^>]*/>', "", xml)
        xml = xml.replace(
            "</Types>", f'<Override PartName="{part}" ContentType="{content_type}"/></Types>'
        )
    present = set(re.findall(r'<Default\b[^>]*Extension="([^"]+)"', xml))
    for name in generated:
        extension = name.rsplit(".", 1)[-1].lower() if "." in name else ""
        if name.startswith("word/media/") and extension in MEDIA_TYPES and extension not in present:
            default = f'<Default Extension="{extension}" ContentType="{MEDIA_TYPES[extension]}"/>'
            xml = xml.replace("</Types>", default + "</Types>")
            present.add(extension)
    generated[path] = xml.encode("utf-8")


def _apply_base_font(template: dict[str, bytes], generated: dict[str, bytes]) -> None:
    source = template.get("word/styles.xml")
    target = generated.get("word/styles.xml")
    if not source or not target:
        return
    match = _DOC_DEFAULT_FONTS.search(source.decode("utf-8", errors="replace"))
    if not match:
        return
    attributes = dict(_ATTR.findall(match.group(1)))
    font = attributes.get("w:ascii") or attributes.get("w:hAnsi")
    if not font:
        return
    text = target.decode("utf-8", errors="replace")
    replacement = f'<w:rFonts w:ascii="{font}" w:hAnsi="{font}" w:cs="{font}" w:eastAsia="{font}"/>'
    updated = _DOC_DEFAULT_FONTS.sub(
        lambda found: re.sub(r"<w:rFonts\b[^>]*/>", replacement, found.group(0), count=1),
        text,
        count=1,
    )
    generated["word/styles.xml"] = updated.encode("utf-8")


def apply_template_branding(template_docx: bytes, generated_docx: bytes) -> bytes:
    template = _read_package(template_docx)
    generated = _read_package(generated_docx)
    if "word/document.xml" not in template or "word/document.xml" not in generated:
        raise BrandingError("Ambos archivos deben ser documentos Word")

    parts = _default_parts(
        template["word/document.xml"],
        _parse_relationships(template.get("word/_rels/document.xml.rels")),
    )
    if not parts:
        return generated_docx

    references: dict[str, str] = {}
    overrides: dict[str, str] = {}
    for kind, rel_type, content_type in (
        ("header", REL_HEADER, CT_HEADER),
        ("footer", REL_FOOTER, CT_FOOTER),
    ):
        source_name = parts.get(kind)
        if not source_name:
            continue
        target_name = _copy_part(kind, source_name, template, generated)
        rel_id = f"rIdInstitucional{kind.title()}"
        _add_document_relationship(generated, rel_id, rel_type, target_name)
        references[kind] = rel_id
        overrides[f"/word/{target_name}"] = content_type

    generated["word/document.xml"] = _rewrite_section_references(
        generated["word/document.xml"], references
    )
    _ensure_content_types(generated, overrides)
    _apply_base_font(template, generated)

    output = BytesIO()
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
        ordered = ["[Content_Types].xml"] + [
            name for name in generated if name != "[Content_Types].xml"
        ]
        for name in ordered:
            archive.writestr(name, generated[name])
    return output.getvalue()


def header_summary(template_docx: bytes) -> dict[str, object]:
    """Texto de la cabecera y presencia de logo, para mostrarlos en la interfaz."""
    template = _read_package(template_docx)
    parts = _default_parts(
        template.get("word/document.xml", b""),
        _parse_relationships(template.get("word/_rels/document.xml.rels")),
    )
    summary: dict[str, object] = {"header_text": "", "footer_text": "", "has_logo": False}
    for kind in ("header", "footer"):
        source = parts.get(kind)
        if not source:
            continue
        xml = template.get(f"word/{source}", b"").decode("utf-8", errors="replace")
        summary[f"{kind}_text"] = " ".join(re.findall(r"<w:t\b[^>]*>([^<]*)</w:t>", xml)).strip()[
            :300
        ]
        rels = _parse_relationships(template.get(f"word/_rels/{source}.rels"))
        if any("image" in attributes.get("Type", "") for attributes in rels.values()):
            summary["has_logo"] = True
    return summary
