-- ===== Shas & Mishnayos Learning Tracker =====

-- Reference table: all 63 masechtos of Mishnah
-- has_bavli indicates which ones have Talmud Bavli (37 masechtos)
CREATE TABLE IF NOT EXISTS shas_masechtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seder TEXT NOT NULL CHECK (seder IN ('zeraim', 'moed', 'nashim', 'nezikin', 'kodshim', 'taharos')),
  name TEXT NOT NULL UNIQUE,
  perakim INT NOT NULL,
  daf_count INT,
  has_bavli BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tracking table: completions with type (gemara or mishnayos)
CREATE TABLE IF NOT EXISTS shas_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  masechta_id UUID REFERENCES shas_masechtos(id) ON DELETE CASCADE,
  completion_type TEXT NOT NULL CHECK (completion_type IN ('gemara', 'mishnayos')),
  completed_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(masechta_id, completion_type)
);

CREATE INDEX IF NOT EXISTS idx_shas_masechtos_seder ON shas_masechtos(seder);
CREATE INDEX IF NOT EXISTS idx_shas_completions_masechta ON shas_completions(masechta_id);
CREATE INDEX IF NOT EXISTS idx_shas_completions_type ON shas_completions(completion_type);

-- Seed all 63 masechtos (perakim counts, daf counts for Bavli, has_bavli flag)
INSERT INTO shas_masechtos (seder, name, perakim, daf_count, has_bavli, sort_order) VALUES
  -- Seder Zeraim (11 masechtos, only Brachos has Bavli)
  ('zeraim', 'Brachos', 9, 64, true, 1),
  ('zeraim', 'Peah', 8, NULL, false, 2),
  ('zeraim', 'Demai', 7, NULL, false, 3),
  ('zeraim', 'Kilayim', 9, NULL, false, 4),
  ('zeraim', 'Shviis', 10, NULL, false, 5),
  ('zeraim', 'Terumos', 11, NULL, false, 6),
  ('zeraim', 'Maasros', 5, NULL, false, 7),
  ('zeraim', 'Maaser Sheni', 5, NULL, false, 8),
  ('zeraim', 'Challah', 4, NULL, false, 9),
  ('zeraim', 'Orlah', 3, NULL, false, 10),
  ('zeraim', 'Bikkurim', 4, NULL, false, 11),

  -- Seder Moed (12 masechtos, all have Bavli)
  ('moed', 'Shabbos', 24, 157, true, 12),
  ('moed', 'Eruvin', 10, 105, true, 13),
  ('moed', 'Pesachim', 10, 121, true, 14),
  ('moed', 'Shekalim', 8, 22, true, 15),
  ('moed', 'Yoma', 8, 88, true, 16),
  ('moed', 'Sukkah', 5, 56, true, 17),
  ('moed', 'Beitzah', 5, 40, true, 18),
  ('moed', 'Rosh Hashanah', 4, 35, true, 19),
  ('moed', 'Taanis', 4, 31, true, 20),
  ('moed', 'Megillah', 4, 32, true, 21),
  ('moed', 'Moed Katan', 3, 29, true, 22),
  ('moed', 'Chagigah', 3, 27, true, 23),

  -- Seder Nashim (7 masechtos, all have Bavli)
  ('nashim', 'Yevamos', 16, 122, true, 24),
  ('nashim', 'Kesubos', 13, 112, true, 25),
  ('nashim', 'Nedarim', 11, 91, true, 26),
  ('nashim', 'Nazir', 9, 66, true, 27),
  ('nashim', 'Sotah', 9, 49, true, 28),
  ('nashim', 'Gittin', 9, 90, true, 29),
  ('nashim', 'Kiddushin', 4, 82, true, 30),

  -- Seder Nezikin (10 masechtos, 8 have Bavli - Eduyos and Avos do not)
  ('nezikin', 'Bava Kamma', 10, 119, true, 31),
  ('nezikin', 'Bava Metzia', 10, 119, true, 32),
  ('nezikin', 'Bava Basra', 10, 176, true, 33),
  ('nezikin', 'Sanhedrin', 11, 113, true, 34),
  ('nezikin', 'Makkos', 3, 24, true, 35),
  ('nezikin', 'Shevuos', 8, 49, true, 36),
  ('nezikin', 'Eduyos', 8, NULL, false, 37),
  ('nezikin', 'Avodah Zarah', 5, 76, true, 38),
  ('nezikin', 'Avos', 6, NULL, false, 39),
  ('nezikin', 'Horayos', 3, 14, true, 40),

  -- Seder Kodshim (11 masechtos, 9 have Bavli - Middos and Kinnim do not)
  ('kodshim', 'Zevachim', 14, 120, true, 41),
  ('kodshim', 'Menachos', 13, 110, true, 42),
  ('kodshim', 'Chullin', 12, 142, true, 43),
  ('kodshim', 'Bechoros', 9, 61, true, 44),
  ('kodshim', 'Arachin', 9, 34, true, 45),
  ('kodshim', 'Temurah', 7, 34, true, 46),
  ('kodshim', 'Kereisos', 6, 28, true, 47),
  ('kodshim', 'Meilah', 6, 22, true, 48),
  ('kodshim', 'Tamid', 7, 10, true, 49),
  ('kodshim', 'Middos', 5, NULL, false, 50),
  ('kodshim', 'Kinnim', 3, NULL, false, 51),

  -- Seder Taharos (12 masechtos, only Niddah has Bavli)
  ('taharos', 'Keilim', 30, NULL, false, 52),
  ('taharos', 'Ohalos', 18, NULL, false, 53),
  ('taharos', 'Negaim', 14, NULL, false, 54),
  ('taharos', 'Parah', 12, NULL, false, 55),
  ('taharos', 'Taharos', 10, NULL, false, 56),
  ('taharos', 'Mikvaos', 10, NULL, false, 57),
  ('taharos', 'Niddah', 10, 73, true, 58),
  ('taharos', 'Machshirin', 6, NULL, false, 59),
  ('taharos', 'Zavim', 5, NULL, false, 60),
  ('taharos', 'Tvul Yom', 4, NULL, false, 61),
  ('taharos', 'Yadayim', 4, NULL, false, 62),
  ('taharos', 'Uktzin', 3, NULL, false, 63)
ON CONFLICT (name) DO NOTHING;
