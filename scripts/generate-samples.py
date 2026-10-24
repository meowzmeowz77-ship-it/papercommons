import re,json,os
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
source=open('components/papers/viewer.tsx').read()
match=re.search(r'const questions:any=(\{.*?\});',source,re.S)
# This literal contains only arrays of strings; decode its quoted keys and values.
literal=match.group(1)
literal=re.sub(r'([{,])([A-Za-z]+):',r'\1"\2":',literal)
literal=re.sub(r"'([^']*)'",lambda m:json.dumps(m.group(1)),literal)
questions=json.loads(literal)
subjects=list(questions)
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
pdfmetrics.registerFont(TTFont('Text',font))
pdfmetrics.registerFont(TTFont('Hindi','scripts/fonts/NotoSansDevanagari-Regular.ttf',shapable=True))
marks=[3,4,4,4,5,5]
def wrap(text,font,size,width):
    lines=[];line=''
    for word in text.split():
        trial=(line+' '+word).strip()
        if pdfmetrics.stringWidth(trial,font,size)>width and line:lines.append(line);line=word
        else:line=trial
    if line:lines.append(line)
    return lines
for i in range(12):
    subject=subjects[i%6]
    c=canvas.Canvas(f'public/samples/sample-{i+1}.pdf',pagesize=A4)
    c.setTitle(f'Class 10 {subject} - PaperCommons practice sample')
    for page in [1,2]:
        w,h=A4
        c.setFillColor(HexColor('#708199'));c.setFont('Helvetica',8)
        c.drawCentredString(w/2,h-48,'PAPERCOMMONS  /  ORIGINAL PRACTICE SAMPLE')
        c.setFillColor(HexColor('#213752'));c.setFont('Helvetica-Bold',17)
        c.drawCentredString(w/2,h-85,subject.upper())
        c.setFont('Helvetica',11);c.drawCentredString(w/2,h-108,'Class 10 | Practice set | 2026')
        c.setFont('Helvetica',10);c.drawString(52,h-143,'Time allowed: 60 minutes');c.drawRightString(w-52,h-143,'Maximum marks: 25')
        c.setStrokeColor(HexColor('#c9d3e0'));c.line(52,h-155,w-52,h-155)
        y=h-184
        if page==1:
            c.setFont('Helvetica-Bold',10);c.drawString(52,y,'General instructions');y-=22
            c.setFont('Helvetica',9)
            for text in ['Attempt all six questions. Marks for each question are shown in brackets.', 'Show working and give examples where relevant.', 'This short sample is not an official CBSE or school examination paper.']:
                c.drawString(52,y,text);y-=17
            y-=20
        c.setFont('Helvetica-Bold',10);c.drawString(52,y,'SECTION '+('A - CONCEPTS & APPLICATION' if page==1 else 'B - EXTENDED PRACTICE'));y-=34
        for j in range((page-1)*3,page*3):
            c.setFont('Helvetica-Bold',11);c.drawString(52,y,str(j+1)+'.');c.drawRightString(w-52,y,'['+str(marks[j])+']')
            f='Hindi' if subject=='Hindi' else 'Text';c.setFont(f,11)
            for line in wrap(questions[subject][j],f,11,w-155):
                c.drawString(76,y,line,shaping=subject=='Hindi');y-=21
            y-=44
        c.setStrokeColor(HexColor('#e3e8ee'))
        for liney in range(int(y)-10,100,-27):c.line(52,liney,w-52,liney)
        c.setFillColor(HexColor('#8c9aae'));c.setFont('Helvetica',8);c.drawCentredString(w/2,42,f'PaperCommons | Page {page} of 2')
        c.showPage()
    c.save()
print('Created 12 two-page PDFs; every sample totals 25 marks.')
