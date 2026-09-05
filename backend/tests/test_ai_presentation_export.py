import io
import zipfile

from PIL import Image

from app.modules.ai.presentation_export import build_presentation_pptx
from app.modules.ai.schemas import PresentationExportRequest


def test_presentation_export_embeds_images(monkeypatch, tmp_path) -> None:
    image_path = tmp_path / "classroom.jpg"
    Image.new("RGB", (1280, 720), color=(47, 112, 226)).save(image_path, quality=85)
    monkeypatch.setattr(
        "app.modules.ai.presentation_export.find_presentation_image",
        lambda _asset_id: image_path,
    )
    slides = [
        {
            "order": index,
            "type": "portada" if index == 1 else "cierre" if index == 3 else "contenido",
            "title": title,
            "subtitle": "Personal Social · 1° de Primaria",
            "key_points": ["Cerramos el grifo", "Usamos solo lo necesario"],
            "highlighted_quote": "El agua es vida",
            "interactive_activity": "Comparte una acción con tu equipo.",
            "speaker_notes": "Explica el contenido y observa la participación del grupo.",
            "visual_prompt": "Niñas y niños cuidando el agua",
            "image_search_query": "children saving water",
            "image_url": "/api/v1/ai/tools/presentation-images/" + "a" * 40,
            "image_alt": "Niñas y niños cuidando el agua",
            "image_attribution": "Imagen creada con Gemini · SynthID",
            "image_license": "Generada con IA",
            "image_width": 1280,
            "image_height": 720,
        }
        for index, title in enumerate(
            ["Guardianes del agua", "Cuidamos cada gota", "Nuestro compromiso"],
            start=1,
        )
    ]
    payload = PresentationExportRequest(
        teacher_name="María Gómez",
        institution="I.E. Avendia",
        curricular_area="Personal Social",
        grade="1° de Primaria",
        visual_style="ilustrado",
        presentation={
            "presentation_title": "Guardianes del agua",
            "learning_objective": "Valorar el agua y proponer acciones para cuidarla.",
            "slides": slides,
        },
    )

    file_bytes, filename = build_presentation_pptx(payload)

    assert filename == "guardianes-del-agua.pptx"
    with zipfile.ZipFile(io.BytesIO(file_bytes)) as archive:
        media = [
            item
            for item in archive.infolist()
            if item.filename.startswith("ppt/media/") and item.file_size
        ]
        slide_files = [
            name
            for name in archive.namelist()
            if name.startswith("ppt/slides/slide") and name.endswith(".xml")
        ]
        cover_xml = archive.read("ppt/slides/slide1.xml").decode("utf-8")
    assert len(slide_files) == 3
    assert media
    # La portada debe conservar una jerarquía limpia: tema e imagen, sin bloques de desarrollo.
    assert "Cerramos el grifo" not in cover_xml
    assert "Comparte una acción con tu equipo." not in cover_xml
