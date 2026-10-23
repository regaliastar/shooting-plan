"""Build portable, image-rich shooting PDFs from the same plan JSON as the site."""
import json
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

ROOT = Path(__file__).resolve().parent.parent
FONT = 'NotoSansSC'
pdfmetrics.registerFont(TTFont(FONT, str(ROOT / 'scripts/fonts/NotoSansSC-Regular.ttf')))
INK, MUTED, LINE, PAPER = '#40575c', '#7c897e', '#d7dbcf', '#f6f1e9'


def paragraph(c, text, x, y, width, size=10, color=INK, leading=None):
    style = ParagraphStyle('copy', fontName=FONT, fontSize=size,
                           leading=leading or size * 1.65, textColor=HexColor(color), wordWrap='CJK')
    p = Paragraph(escape(str(text)).replace('\n', '<br/>'), style)
    _, height = p.wrap(width, 600)
    p.drawOn(c, x, y - height)
    return y - height


def diagrams(c, shot, x, y, width, layout):
    """Vector composition / top-down station diagrams, including on-camera flash."""
    c.saveState()
    c.translate(x, y)
    c.scale(width / 340, width / 340)
    c.setFillColor(HexColor('#eaf0e8'))
    c.roundRect(0, 0, 340, 270, 4, fill=1, stroke=0)
    c.setStrokeColor(HexColor('#b9c6b9'))
    c.setLineWidth(1.5)
    if layout == 'frame':
        wide = '横幅' in shot['frame']
        fx, fy, fw, fh = (37, 48, 266, 177) if wide else (90, 30, 160, 212)
        c.setFillColor(HexColor('#dde5de'))
        c.rect(fx, fy, fw, fh, fill=1, stroke=1)
        c.setDash(4, 5)
        for fraction in (1 / 3, 2 / 3):
            c.line(fx + fw * fraction, fy, fx + fw * fraction, fy + fh)
            c.line(fx, fy + fh * fraction, fx + fw, fy + fh * fraction)
        c.setDash()
        c.saveState()
        path = c.beginPath()
        path.rect(fx, fy, fw, fh)
        c.clipPath(path, stroke=0)
        if shot['diagram']['kind'] == 'steps':
            for sy in (80, 110, 140):
                c.line(fx, sy, fx + fw, sy)
        seated = shot['diagram']['kind'] == 'steps'
        full = shot['id'] in ('02', '04')
        scale = .9 if full or seated else 1.25
        c.translate(190, 140 if seated else 122 if full else 112)
        c.scale(scale, scale)
        c.setFillColor(HexColor('#374b55'))
        c.roundRect(-48 if seated else -40, -70 if seated else -24, 17, 116, 8, stroke=0, fill=1)
        c.setFillColor(HexColor('#6988aa'))
        c.circle(0, 67, 18, fill=1, stroke=0)
        c.setFillColor(HexColor('#eaded0'))
        c.circle(0, 60, 13, fill=1, stroke=0)
        c.setFillColor(HexColor('#fffdf6'))
        c.rect(-17, -2, 34, 45, fill=1, stroke=0)
        c.setFillColor(HexColor('#374b55'))
        c.rect(-20, -18, 40, 18, fill=1, stroke=0)
        c.setStrokeColor(HexColor('#374b55'))
        c.setLineWidth(4)
        c.line(-17, 30, -28, 5)
        c.line(17, 30, 27, 5)
        if seated:
            c.line(-10, -18, 18, -37)
            c.line(18, -37, 32, -76)
            c.line(10, -18, 43, -36)
            c.line(43, -36, 55, -72)
        else:
            c.line(-10, -18, -14, -67)
            c.line(10, -18, 22, -67)
        c.restoreState()
        paragraph(c, shot['frame'], 15, 23, 310, 11, MUTED)
    else:
        d = shot['diagram']
        c.setLineWidth(5)
        c.line(25, 234, 315, 234)
        paragraph(c, d['backgroundDistance'], 60, 263, 245, 12, MUTED)
        c.setLineWidth(1.5)
        c.setDash(5, 5)
        c.line(170, 174, 126, 49)
        c.line(170, 174, 214, 49)
        c.line(170, 151, 170, 65)
        c.setDash()
        c.setFillColor(HexColor('#6988aa'))
        c.circle(170, 174, 18, fill=1, stroke=0)
        paragraph(c, '人物', 199, 158, 65, 12, MUTED)
        paragraph(c, d['cameraDistance'], 183, 120, 120, 12, MUTED)
        c.setFillColor(HexColor('#374b55'))
        c.roundRect(150, 36, 40, 25, 4, fill=1, stroke=0)
        c.setFillColor(HexColor('#93a5b5'))
        c.circle(170, 49, 9, fill=1, stroke=0)
        if d['flash']:
            c.setStrokeColor(HexColor('#bba26c'))
            c.setLineWidth(3)
            c.line(176, 76, 166, 64)
            c.line(166, 64, 176, 64)
            c.line(176, 64, 165, 53)
        paragraph(c, '相机 + 机顶闪光' if d['flash'] else '相机 / 闪光关闭', 90, 29, 210, 11, MUTED)
        backlight = d['kind'] == 'backlight'
        lx, ly = (282, 211) if backlight else (49, 113)
        c.setFillColor(HexColor('#e0cc9e'))
        c.circle(lx, ly, 17, fill=1, stroke=0)
        c.setStrokeColor(HexColor('#b99c64'))
        c.line(lx - 8 if backlight else lx + 15, ly - 10 if backlight else ly + 10, 145 if not backlight else 199, 172)
        label = '侧后夕阳' if backlight else '环境灯光' if d['kind'] == 'night' else '天空主光'
        paragraph(c, label, lx - 32, ly - 25, 85, 11, MUTED)
    c.restoreState()


def build(plan):
    out = ROOT / 'dist/briefs' / (plan['slug'] + '.pdf')
    out.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(out), pagesize=A4, pageCompression=1)
    c.setTitle(plan.get('story', {}).get('title', plan['title']) + ' - ' + plan['title'])
    c.setAuthor('BLUE HOUR')
    c.setSubject('AI 效果示意、构图、动作与灯位')
    w, h = A4
    for index, shot in enumerate(plan['coreShots'], 1):
        c.setFillColor(HexColor(PAPER))
        c.rect(0, 0, w, h, stroke=0, fill=1)
        paragraph(c, 'BLUE HOUR / PHOTO JOURNAL', 38, h - 28, 300, 8, MUTED)
        c.setStrokeColor(HexColor(LINE))
        c.line(38, h - 50, w - 38, h - 50)
        paragraph(c, plan.get('story', {}).get('title', plan['title']), 38, h - 65, 400, 23)
        paragraph(c, plan['title'] + ' / ' + plan.get('execution', {}).get('dateLabel', '日期待定') + ' / ' + plan['duration'], 38, h - 103, 500, 9, MUTED)
        chapter = next((g['title'] for g in plan.get('story', {}).get('chapters', []) if shot['id'] in g['shots']), '')
        paragraph(c, chapter, 38, 708, 300, 10, MUTED)
        image = ROOT / shot['preview']['image'].lstrip('/')
        c.setFillColor(HexColor('#fffdf8'))
        c.rect(34, 305, 310, 390, fill=1, stroke=0)
        c.drawImage(str(image), 39, 315, width=300, height=375, preserveAspectRatio=True, anchor='c', mask='auto')
        right, width = 365, w - 403
        paragraph(c, shot['id'], right, 690, width, 25, '#a0afa1')
        title_end = paragraph(c, shot['title'], right, 646, width, 16)
        paragraph(c, shot['frame'], right, title_end - 12, width, 9, MUTED)
        cursor = min(560, title_end - 48)
        for label, text in [('画面', shot['preview']['effect']), ('动作', shot['preview']['pose']), ('光感', shot['preview']['light']), ('构图', shot['preview'].get('composition', shot['frame']))]:
            cursor = paragraph(c, label, right, cursor, width, 9, '#ac9480')
            cursor = paragraph(c, text, right, cursor - 5, width, 9, INK) - 17
        cursor = paragraph(c, '机位：' + shot['diagram']['cameraHeight'], right, cursor + 4, width, 8, MUTED)
        if cursor < 272:
            raise ValueError('PDF copy too long for one shot page: ' + shot['id'])
        paragraph(c, '01 / 构图示意', 38, 281, 230, 10)
        paragraph(c, '02 / 机位与灯位（俯视）', 306, 281, 250, 10)
        diagrams(c, shot, 38, 73, 244, 'frame')
        diagrams(c, shot, 306, 73, 244, 'top')
        paragraph(c, '示意图非现场实测比例；黄色为环境光，闪光始终在机顶。', 38, 66, 515, 8, MUTED)
        c.line(38, 41, w - 38, 41)
        paragraph(c, 'AI 效果示意，非实拍 / 图片、构图与方案同步更新', 38, 32, 450, 7, MUTED)
        paragraph(c, str(index) + ' / ' + str(len(plan['coreShots'])), w - 70, 32, 40, 7, MUTED)
        c.showPage()
    c.save()
    print('Built PDF:', out.relative_to(ROOT))


if __name__ == '__main__':
    for file in sorted((ROOT / 'content/plans').glob('*.json')):
        plan = json.loads(file.read_text())
        if plan.get('published') is not False:
            build(plan)
