
/*
# Add New Categories for v2

1. New Category Rows
- Graphic Design (CorelDRAW, Adobe Illustrator)
- Microsoft Office (Word, Excel, PowerPoint)
- Figma (Figma files)
- 3D Modeling (expanded from existing 3D Printing)

2. Existing Categories
- All 14 categories from v1 remain intact
- No data loss or destructive changes
*/

INSERT INTO public.design_categories (name, slug, description, icon)
VALUES
  ('CorelDRAW', 'coreldraw', 'CorelDRAW CDR, CDRX, CMX vector graphics files', 'pen-tool'),
  ('Adobe Illustrator', 'adobe-illustrator', 'Adobe AI, EPS vector graphics files', 'pen-tool'),
  ('Adobe Photoshop', 'adobe-photoshop', 'Adobe PSD, PSB image files', 'image'),
  ('Adobe InDesign', 'adobe-indesign', 'Adobe INDD page layout files', 'layout'),
  ('Microsoft Office', 'microsoft-office', 'Word DOCX, Excel XLSX, PowerPoint PPTX', 'file-text'),
  ('Figma', 'figma', 'Figma design files and prototypes', 'figma')
ON CONFLICT (name) DO NOTHING;
