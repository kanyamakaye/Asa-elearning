"""Renders a Certificate as a professional, landscape PDF.

Uses Pillow only (already a dependency for course thumbnails) — Pillow can
export an RGB image directly as a single-page PDF, so no extra PDF library
is needed.
"""

from functools import lru_cache
from io import BytesIO
from pathlib import Path

from django.core.files.base import ContentFile
from PIL import Image, ImageDraw, ImageFont

# A4 landscape at 200 DPI.
WIDTH, HEIGHT = 2338, 1653
DPI = 200

# Asa Academy's actual brand mark (cropped from frontend/src/assets/logo.png
# down to just the graphic — no wordmark — with a transparent background so
# it drops cleanly onto the certificate's cream background).
LOGO_PATH = Path(__file__).resolve().parent / 'assets' / 'logo_icon.png'
LOGO_HEIGHT = 130


@lru_cache(maxsize=1)
def load_logo():
    try:
        icon = Image.open(LOGO_PATH).convert('RGBA')
    except OSError:
        return None
    ratio = LOGO_HEIGHT / icon.height
    return icon.resize((round(icon.width * ratio), LOGO_HEIGHT), Image.Resampling.LANCZOS)

NAVY = (10, 20, 64)
GOLD = (180, 140, 46)
CREAM = (252, 250, 244)
MUTED = (100, 108, 140)

FONT_PATHS = {
    'bold': 'C:/Windows/Fonts/arialbd.ttf',
    'regular': 'C:/Windows/Fonts/arial.ttf',
    'italic': 'C:/Windows/Fonts/ariali.ttf',
}


def load_font(kind, size):
    try:
        return ImageFont.truetype(FONT_PATHS[kind], size)
    except OSError:
        return ImageFont.load_default()


def centered_text(draw, cx, y, text, font, fill):
    w = draw.textlength(text, font=font)
    draw.text((cx - w / 2, y), text, font=font, fill=fill)
    return w


def wrap_text(draw, text, font, max_width):
    words = text.split()
    lines, current = [], ''
    for word in words:
        trial = f'{current} {word}'.strip()
        if draw.textlength(trial, font=font) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_seal(draw, cx, cy, radius, label):
    """A simple decorative medallion — two concentric gold rings around a
    navy disc with a star, standing in for an embossed seal graphic."""
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=GOLD, width=6)
    draw.ellipse(
        [cx - radius + 14, cy - radius + 14, cx + radius - 14, cy + radius - 14],
        outline=GOLD, width=2,
    )
    inner_r = radius - 30
    draw.ellipse([cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r], fill=NAVY)

    # Five-pointed star, centered in the disc.
    import math
    points = []
    for i in range(10):
        r = inner_r * 0.62 if i % 2 == 0 else inner_r * 0.28
        angle = math.pi / 2 + i * math.pi / 5
        points.append((cx + r * math.cos(angle), cy - r * math.sin(angle)))
    draw.polygon(points, fill=GOLD)

    label_font = load_font('bold', 20)
    lw = draw.textlength(label, font=label_font)
    draw.text((cx - lw / 2, cy + inner_r + 16), label, font=label_font, fill=GOLD)


def render_certificate_image(certificate):
    course = certificate.course
    student_name = certificate.student.full_name
    instructor_name = course.instructor.full_name if course.instructor_id else 'Asa Academy'

    img = Image.new('RGB', (WIDTH, HEIGHT), CREAM)
    draw = ImageDraw.Draw(img)
    cx = WIDTH // 2

    # Border frame.
    margin = 56
    draw.rectangle([margin, margin, WIDTH - margin, HEIGHT - margin], outline=NAVY, width=7)
    inner = margin + 26
    draw.rectangle([inner, inner, WIDTH - inner, HEIGHT - inner], outline=GOLD, width=3)

    content_top = inner + 50

    # Brand mark + wordmark + rule.
    logo = load_logo()
    if logo:
        img.paste(logo, (cx - logo.width // 2, content_top), logo)
        wordmark_y = content_top + LOGO_HEIGHT + 18
    else:
        wordmark_y = content_top + 20
    centered_text(draw, cx, wordmark_y, 'ASA ACADEMY', load_font('bold', 42), NAVY)
    rule_y = wordmark_y + 66
    draw.line([(cx - 160, rule_y), (cx + 160, rule_y)], fill=GOLD, width=3)

    # Title.
    centered_text(draw, cx, rule_y + 40, 'Certificate of Completion', load_font('bold', 88), NAVY)

    # Preamble.
    y = rule_y + 190
    centered_text(draw, cx, y, 'This is to certify that', load_font('italic', 32), MUTED)

    # Student name.
    y += 60
    name_font = load_font('bold', 66)
    name_w = centered_text(draw, cx, y, student_name, name_font, GOLD)
    underline_y = y + name_font.size + 14
    draw.line([(cx - name_w / 2 - 24, underline_y), (cx + name_w / 2 + 24, underline_y)], fill=GOLD, width=2)

    # "has completed" + course title (wraps if long).
    y = underline_y + 40
    centered_text(draw, cx, y, 'has successfully completed the course', load_font('italic', 32), MUTED)

    y += 66
    course_font = load_font('bold', 50)
    course_lines = wrap_text(draw, course.title, course_font, WIDTH - 2 * (inner + 160))
    while len(course_lines) > 2 and course_font.size > 30:
        course_font = load_font('bold', course_font.size - 4)
        course_lines = wrap_text(draw, course.title, course_font, WIDTH - 2 * (inner + 160))
    for line in course_lines:
        centered_text(draw, cx, y, line, course_font, NAVY)
        y += course_font.size + 16

    # Issue date + level line.
    y += 20
    meta_text = f'Issued on {certificate.issue_date.strftime("%B %d, %Y")} · {course.get_level_display()} Level · {course.duration_hours}h'
    centered_text(draw, cx, y, meta_text, load_font('regular', 28), MUTED)

    # A decorative rule fills the gap to the signature block, which sits a
    # fixed distance below the (variable-height) content instead of being
    # pinned to the bottom of the page — keeps short and long course titles
    # both looking balanced instead of leaving a huge blank gap.
    rule2_y = y + 90
    draw.line([(cx - 90, rule2_y), (cx + 90, rule2_y)], fill=GOLD, width=2)
    draw.ellipse([cx - 5, rule2_y - 5, cx + 5, rule2_y + 5], fill=GOLD)

    sig_y = min(HEIGHT - inner - 170, y + 340)
    left_x = inner + 180
    right_x = WIDTH - inner - 180

    draw.line([(left_x - 160, sig_y), (left_x + 160, sig_y)], fill=NAVY, width=2)
    centered_text(draw, left_x, sig_y + 14, instructor_name, load_font('bold', 26), NAVY)
    centered_text(draw, left_x, sig_y + 48, 'Lead Instructor', load_font('regular', 22), MUTED)

    draw.line([(right_x - 160, sig_y), (right_x + 160, sig_y)], fill=NAVY, width=2)
    centered_text(draw, right_x, sig_y + 14, 'Asa Academy', load_font('bold', 26), NAVY)
    centered_text(draw, right_x, sig_y + 48, 'Program Director', load_font('regular', 22), MUTED)

    # Decorative seal, centered between the two signature lines.
    draw_seal(draw, cx, sig_y - 10, 78, 'VERIFIED')

    # Footer — certificate number, verification code, and where to check it.
    footer_font = load_font('regular', 24)
    footer_y = HEIGHT - inner - 60
    centered_text(
        draw, cx, footer_y,
        f'Certificate No. {certificate.certificate_number}   ·   Verification Code {certificate.verification_code}',
        footer_font, MUTED,
    )
    centered_text(
        draw, cx, footer_y + 32,
        f'Verify this certificate at asaacademy.com/verify-certificate?code={certificate.verification_code}',
        load_font('italic', 22), MUTED,
    )

    return img


def draw_watermark(img, text):
    """Stamps a large, semi-transparent diagonal watermark across the whole
    certificate — used for course-page previews so a sample can never be
    mistaken for (or passed off as) a real, verifiable certificate."""
    layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    ldraw = ImageDraw.Draw(layer)
    font = load_font('bold', 210)
    tw = ldraw.textlength(text, font=font)
    ldraw.text((img.width / 2 - tw / 2, img.height / 2 - 105), text, font=font, fill=(*NAVY, 45))
    layer = layer.rotate(28, resample=Image.Resampling.BICUBIC, center=(img.width / 2, img.height / 2))
    img.paste(layer, (0, 0), layer)


def render_sample_certificate_image(course):
    """A non-persisted, illustrative certificate for a course's detail page —
    same layout as a real certificate, with placeholder student/number/code
    values and a SAMPLE watermark, so prospective students can see what
    they'll earn without it being (or looking like) an issued certificate."""
    from datetime import date
    from types import SimpleNamespace

    fake_certificate = SimpleNamespace(
        student=SimpleNamespace(full_name='Your Name Here'),
        course=course,
        issue_date=date.today(),
        certificate_number='ASA-CERT-SAMPLE',
        verification_code='SAMPLE',
    )
    img = render_certificate_image(fake_certificate)
    draw_watermark(img, 'SAMPLE')
    return img


def generate_certificate_file(certificate):
    """Renders the certificate and attaches it to certificate.certificate_file
    (not saved to the DB — caller is responsible for calling .save())."""
    img = render_certificate_image(certificate)
    buffer = BytesIO()
    img.save(buffer, format='PDF', resolution=DPI)
    filename = f'{certificate.certificate_number}.pdf'
    certificate.certificate_file.save(filename, ContentFile(buffer.getvalue()), save=False)
