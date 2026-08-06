#!/usr/bin/env python3
"""
Generate an idempotent SQL import for the full APPSC syllabus from the
uploaded micro-themes JSON.

Mapping:  section -> subjects.name ; unit -> topic ; theme -> subtopic ;
          micro_theme -> title ; id -> external_id ; plus geographic_scope,
          cognitive_level. Deterministic uuid5 ids make re-runs safe.

Usage:  python3 scripts/generate_syllabus_import.py <input.json> > supabase/import_syllabus.sql
"""
import json
import re
import sys
import unicodedata
import uuid

NS = uuid.uuid5(uuid.NAMESPACE_URL, "appsc-group1-platform")

# Slugs already used by the sample seed — reserve so the import never collides.
RESERVED_SLUGS = {
    "satavahana-dynasty",
    "ikshvakus-of-vijayapuri",
    "rivers-of-andhra-pradesh",
}


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text[:80].rstrip("-")


def q(v):
    if v is None:
        return "null"
    return "'" + str(v).replace("'", "''") + "'"


def main(path: str) -> None:
    data = json.load(open(path))
    mts = data["micro_themes"]

    subjects = {}       # key -> (id, name, stage, paper, order)
    subj_order = 0
    used_slugs = set(RESERVED_SLUGS)
    mt_rows = []
    mt_counter = {}     # subject_id -> running display_order

    for m in mts:
        stage = m["stage"].strip().lower()          # 'prelims' | 'mains'
        paper = m["paper"].strip()
        section = m["section"].strip()
        skey = f"subject|{stage}|{paper}|{section}"
        if skey not in subjects:
            sid = str(uuid.uuid5(NS, skey))
            subjects[skey] = (sid, section, stage, paper, subj_order)
            subj_order += 1
        sid = subjects[skey][0]

        unit_no = str(m.get("unit_no") or "").strip()
        unit = m["unit"].strip()
        topic = f"{unit_no}. {unit}" if unit_no else unit
        subtopic = (m.get("theme") or "").strip() or None
        title = m["micro_theme"].strip()

        base = slugify(title) or slugify(m["id"])
        slug = base
        n = 2
        while slug in used_slugs:
            slug = f"{base}-{n}"
            n += 1
        used_slugs.add(slug)

        order = mt_counter.get(sid, 0)
        mt_counter[sid] = order + 1

        mt_rows.append(
            (
                str(uuid.uuid5(NS, f"microtheme|{m['id']}")),
                sid,
                topic,
                subtopic,
                title,
                slug,
                order,
                m["id"],
                m.get("geographic_scope"),
                m.get("cognitive_level"),
            )
        )

    out = []
    out.append("-- ============================================================")
    out.append(f"-- APPSC full syllabus import — {len(subjects)} subjects, {len(mt_rows)} micro-themes")
    out.append(f"-- Source: {data.get('source','')}")
    out.append("-- Idempotent (deterministic uuid5 ids + ON CONFLICT). Non-destructive.")
    out.append("-- Run after migrations 0001-0004.")
    out.append("-- ============================================================")
    out.append("begin;")
    out.append("")

    out.append("insert into subjects (id, name, stage, paper, display_order) values")
    svals = [
        f"  ({q(sid)}, {q(name)}, {q(stage)}, {q(paper)}, {order})"
        for (sid, name, stage, paper, order) in subjects.values()
    ]
    out.append(",\n".join(svals))
    out.append(
        "on conflict (id) do update set "
        "name=excluded.name, stage=excluded.stage, paper=excluded.paper, "
        "display_order=excluded.display_order;"
    )
    out.append("")

    # micro-themes in chunks to keep statements manageable
    cols = ("id, subject_id, topic, subtopic, title, slug, display_order, "
            "external_id, geographic_scope, cognitive_level")
    CHUNK = 100
    for i in range(0, len(mt_rows), CHUNK):
        chunk = mt_rows[i:i + CHUNK]
        out.append(f"insert into microthemes ({cols}) values")
        rows = []
        for (mid, sid, topic, subtopic, title, slug, order, ext, geo, cog) in chunk:
            rows.append(
                f"  ({q(mid)}, {q(sid)}, {q(topic)}, {q(subtopic)}, {q(title)}, "
                f"{q(slug)}, {order}, {q(ext)}, {q(geo)}, {q(cog)})"
            )
        out.append(",\n".join(rows))
        out.append(
            "on conflict (id) do update set "
            "subject_id=excluded.subject_id, topic=excluded.topic, "
            "subtopic=excluded.subtopic, title=excluded.title, slug=excluded.slug, "
            "display_order=excluded.display_order, external_id=excluded.external_id, "
            "geographic_scope=excluded.geographic_scope, "
            "cognitive_level=excluded.cognitive_level;"
        )
        out.append("")

    out.append("commit;")
    out.append("")
    print("\n".join(out))


if __name__ == "__main__":
    main(sys.argv[1])
