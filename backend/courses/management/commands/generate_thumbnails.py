import random
from io import BytesIO

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from PIL import Image, ImageDraw, ImageFont

from courses.models import Course

WIDTH, HEIGHT = 800, 450

# Two-color diagonal gradient per real seeded category (see accounts.seed_data
# .CATEGORIES) — courses with no category, or a category not in this map,
# fall back to DEFAULT_COLORS.
CATEGORY_COLORS = {
    'Information Technology': ((10, 20, 64), (29, 79, 216)),
    'Software Development': ((8, 47, 73), (6, 182, 212)),
    'Data Science': ((49, 10, 101), (139, 92, 246)),
    'Business': ((69, 39, 8), (245, 158, 11)),
    'Accounting': ((6, 46, 30), (16, 185, 129)),
    'Digital Marketing': ((76, 5, 43), (236, 72, 153)),
    'Languages': ((30, 20, 90), (99, 102, 241)),
    'Professional Development': ((30, 35, 45), (100, 116, 139)),
}
DEFAULT_COLORS = ((10, 20, 64), (47, 95, 255))

FONT_PATHS = {
    'bold': 'C:/Windows/Fonts/arialbd.ttf',
    'regular': 'C:/Windows/Fonts/arial.ttf',
}


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_gradient(color_a, color_b):
    """A smooth diagonal 2-color gradient, built by resizing a 2x2 seed image
    (fast, C-optimized resize) rather than blending 360,000 pixels in
    pure Python."""
    base = Image.new('RGB', (2, 2), color_a)
    base.putpixel((1, 1), color_b)
    mid = lerp(color_a, color_b, 0.5)
    base.putpixel((1, 0), mid)
    base.putpixel((0, 1), mid)
    return base.resize((WIDTH, HEIGHT), Image.Resampling.BICUBIC)


def load_font(kind, size):
    try:
        return ImageFont.truetype(FONT_PATHS[kind], size)
    except OSError:
        return ImageFont.load_default()


def wrap_title(draw, text, font, max_width):
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


def render_thumbnail(course):
    category_name = course.category.name if course.category else None
    color_a, color_b = CATEGORY_COLORS.get(category_name, DEFAULT_COLORS)

    img = make_gradient(color_a, color_b).convert('RGBA')

    # Decorative translucent circles for texture — deterministic per course
    # so re-running the command doesn't reshuffle every thumbnail.
    overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    rand = random.Random(course.id)
    for _ in range(3):
        r = rand.randint(80, 220)
        cx, cy = rand.randint(0, WIDTH), rand.randint(0, HEIGHT)
        odraw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255, 16))
    img = Image.alpha_composite(img, overlay)

    # Bottom shade so white title text stays legible over any gradient.
    shade = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shade)
    for y in range(HEIGHT):
        alpha = int(150 * max(0, (y - HEIGHT * 0.3) / (HEIGHT * 0.7)))
        sdraw.line([(0, y), (WIDTH, y)], fill=(0, 0, 0, alpha))
    img = Image.alpha_composite(img, shade)

    draw = ImageDraw.Draw(img)

    if category_name:
        cat_font = load_font('bold', 20)
        label = category_name.upper()
        pad_x, pad_y = 14, 8
        tw = draw.textlength(label, font=cat_font)
        draw.rounded_rectangle(
            [40, 36, 40 + tw + pad_x * 2, 36 + 20 + pad_y * 2],
            radius=999, fill=(255, 255, 255, 235),
        )
        draw.text((40 + pad_x, 36 + pad_y), label, font=cat_font, fill=color_a)

    title_font = load_font('bold', 44)
    lines = wrap_title(draw, course.title, title_font, WIDTH - 80)
    while len(lines) > 3 and title_font.size > 26:
        title_font = load_font('bold', title_font.size - 4)
        lines = wrap_title(draw, course.title, title_font, WIDTH - 80)
    lines = lines[:3]

    line_height = title_font.size + 10
    y = HEIGHT - 40 - line_height * len(lines)
    for line in lines:
        draw.text((42, y + 2), line, font=title_font, fill=(0, 0, 0, 110))
        draw.text((40, y), line, font=title_font, fill=(255, 255, 255, 255))
        y += line_height

    return img.convert('RGB')


class Command(BaseCommand):
    help = "Generate a category-themed thumbnail image (with the course title baked in) for every course that doesn't have one."

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='Regenerate even for courses that already have a thumbnail.')

    def handle(self, *args, **options):
        force = options['force']
        queryset = Course.objects.select_related('category').all()
        updated = 0
        for course in queryset:
            if course.thumbnail and not force:
                continue
            image = render_thumbnail(course)
            buffer = BytesIO()
            image.save(buffer, format='JPEG', quality=87)
            content = ContentFile(buffer.getvalue())
            filename = f'{course.slug}.jpg'
            course.thumbnail.save(filename, content, save=False)
            course.image.save(filename, content, save=False)
            course.save(update_fields=['thumbnail', 'image'])
            updated += 1

        self.stdout.write(self.style.SUCCESS(f'Generated thumbnails for {updated} course(s).'))
