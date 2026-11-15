-- Development seed (DEVELOPMENT DATA — not reviewed medical content).
insert into public.health_education_content (slug, language, title, body, source_urls, review_status)
values
  ('befast', 'en', 'BE-FAST warning signs (draft)', 'DEVELOPMENT DATA — pending medical review.', array['https://www.stroke.org/en/about-stroke/stroke-symptoms'], 'draft'),
  ('befast', 'fr', 'Signes BE-FAST (brouillon)', 'DONNÉES DE DÉVELOPPEMENT — en attente de relecture médicale.', array['https://www.ameli.fr'], 'draft'),
  ('befast', 'de', 'BE-FAST-Warnzeichen (Entwurf)', 'ENTWICKLUNGSDATEN — medizinische Prüfung ausstehend.', array['https://www.schlaganfall-hilfe.de'], 'draft')
on conflict do nothing;
