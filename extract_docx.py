from docx import Document
import sys

doc = Document(r"C:\Users\sanji\Downloads\SkillGrid_Project_Report(B).docx")
for para in doc.paragraphs:
    print(para.text)
