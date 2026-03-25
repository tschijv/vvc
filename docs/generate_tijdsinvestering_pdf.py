#!/usr/bin/env python3
"""Genereer PDF: Tijdsinvestering AI vs Klassiek"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)

VNG_BLUE = HexColor("#1a6ca8")
DARK = HexColor("#1a1a1a")
GRAY = HexColor("#666666")
LIGHT_BLUE = HexColor("#e8f0f8")
LIGHT_GRAY = HexColor("#f5f5f5")
WHITE = HexColor("#ffffff")

def build_pdf():
    doc = SimpleDocTemplate(
        "/Users/toineschijvenaars/claude/vvc/docs/Tijdsinvestering AI vs Klassiek.pdf",
        pagesize=A4,
        topMargin=25*mm, bottomMargin=20*mm,
        leftMargin=25*mm, rightMargin=25*mm
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle("CustomTitle", parent=styles["Title"],
        fontSize=22, textColor=VNG_BLUE, spaceAfter=6, fontName="Helvetica-Bold")
    subtitle_style = ParagraphStyle("Subtitle", parent=styles["Normal"],
        fontSize=12, textColor=GRAY, spaceAfter=20, fontName="Helvetica")
    h1 = ParagraphStyle("H1", parent=styles["Heading1"],
        fontSize=16, textColor=VNG_BLUE, spaceBefore=20, spaceAfter=10, fontName="Helvetica-Bold")
    h2 = ParagraphStyle("H2", parent=styles["Heading2"],
        fontSize=13, textColor=DARK, spaceBefore=14, spaceAfter=8, fontName="Helvetica-Bold")
    body = ParagraphStyle("Body", parent=styles["Normal"],
        fontSize=10, textColor=DARK, spaceAfter=6, fontName="Helvetica", leading=14)
    body_bold = ParagraphStyle("BodyBold", parent=body, fontName="Helvetica-Bold")
    small = ParagraphStyle("Small", parent=body, fontSize=9, textColor=GRAY)
    note_style = ParagraphStyle("Note", parent=body,
        fontSize=9, textColor=HexColor("#333333"), leftIndent=10, rightIndent=10,
        backColor=LIGHT_BLUE, borderPadding=8, spaceAfter=12, leading=13)

    story = []

    # Title
    story.append(Paragraph("Tijdsinvestering AI vs Klassiek", title_style))
    story.append(Paragraph("VNG Voorzieningencatalogus - Ontwikkelanalyse", subtitle_style))
    story.append(Spacer(1, 4))

    # Meta info
    meta_data = [
        ["Opdrachtgever", "VNG (Vereniging van Nederlandse Gemeenten)"],
        ["Uitvoering", "ArchiXL"],
        ["Datum", "19 maart 2026"],
        ["Project", "Voorzieningencatalogus (VVC)"],
    ]
    meta_table = Table(meta_data, colWidths=[90, 350])
    meta_table.setStyle(TableStyle([
        ("FONTNAME", (0,0), (0,-1), "Helvetica-Bold"),
        ("FONTNAME", (1,0), (1,-1), "Helvetica"),
        ("FONTSIZE", (0,0), (-1,-1), 9),
        ("TEXTCOLOR", (0,0), (0,-1), GRAY),
        ("TEXTCOLOR", (1,0), (1,-1), DARK),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 16))

    # Intro
    story.append(Paragraph("1. Inleiding", h1))
    story.append(Paragraph(
        "De VNG Voorzieningencatalogus is in korte tijd ontwikkeld met behulp van AI-ondersteunde ontwikkeling. "
        "Dit document analyseert de daadwerkelijke tijdsinvestering en vergelijkt deze met een klassieke ontwikkelaanpak. "
        "Het doel is om inzicht te geven in de productiviteitswinst en de randvoorwaarden die dit mogelijk maken.",
        body))

    # AI-assisted timeline
    story.append(Paragraph("2. Tijdsinvestering AI-ondersteund", h1))

    story.append(Paragraph("Fase 1: Prototype (3 werkdagen)", h2))
    story.append(Paragraph(
        "Het eerste werkende prototype is in drie werkdagen gerealiseerd. Dit omvatte: Next.js applicatieskelet, "
        "Prisma datamodel met 20+ entiteiten, NextAuth authenticatie met rollen, basispagina's voor gemeenten, "
        "pakketten, leveranciers, standaarden en referentiecomponenten, en initiële data-import vanuit Drupal CSV-exports.",
        body))

    story.append(Paragraph("Fase 2: Doorontwikkeling (5-7 werkdagen)", h2))
    story.append(Paragraph(
        "In de daaropvolgende sessies is het prototype uitgebouwd met geavanceerde functionaliteit: "
        "AI-adviseur (Claude-integratie), compliancy monitor, inkoopondersteuning, interactieve kaart, "
        "gemeenten vergelijken, zoeken met fuzzy matching, begrippenkader (live SKOSMOS), "
        "koppelingenmatrix, samenwerkingsverbanden, admin panel met 10+ secties, en datamigratie-tooling.",
        body))

    story.append(Paragraph("Fase 3: Polish en extra features (2-3 werkdagen)", h2))
    story.append(Paragraph(
        "De laatste fase omvatte: Linked Data publicatie (JSON-LD, Turtle, RDF/XML met DCAT catalog), "
        "RSS/Atom feed, print-vriendelijke styles, share-functionaliteit, homepage zoekbalk, "
        "laatste wijzigingen feed, vergelijkbare gemeenten (Jaccard-similariteit), bulk-vergelijking tot 4 gemeenten, "
        "loading skeletons, keyboard shortcuts, breadcrumbs, CSV export op 3 pagina's, "
        "lege states, dynamische PvE-analyse, anonimisatietool, demo draaiboek, "
        "en samenvoeging van gemeente-detailpagina en dashboard.",
        body))

    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "<b>Totaal AI-ondersteund: circa 10-12 werkdagen (2-2,5 weken), 1 persoon</b>",
        body_bold))

    # Detailed comparison table
    story.append(Paragraph("3. Gedetailleerde vergelijking per onderdeel", h1))
    story.append(Paragraph(
        "Onderstaande tabel toont per onderdeel de geschatte inspanning bij AI-ondersteunde "
        "versus klassieke ontwikkeling.",
        body))

    table_data = [
        ["Onderdeel", "AI", "Klassiek", "Toelichting"],
        ["Setup (Next.js, Prisma, auth, CI)", "0,5 d", "3-5 d", "Boilerplate, config, auth setup"],
        ["Datamodel (20+ modellen)", "0,5 d", "5-8 d", "Schema-ontwerp, review, migraties"],
        ["Basispagina's (5 entiteiten)", "2 d", "15-20 d", "CRUD, zoeken, filteren, paginering"],
        ["Dashboard (KPI's, tabs, filters)", "1 d", "8-10 d", "Complexe queries, sidebar, tabs"],
        ["Compliancy Monitor", "0,5 d", "3-5 d", "Matrix-view, kruistabel"],
        ["Inkoopondersteuning", "0,5 d", "3-4 d", "Selectielogica, aanbevelingen"],
        ["Gemeenten vergelijken (4x, Jaccard)", "0,5 d", "4-6 d", "Algoritme, matrix-UI, selectors"],
        ["AI-adviseur (Claude)", "0,5 d", "3-5 d", "API, streaming, prompt engineering"],
        ["Zoeken (fuzzy, pg_trgm)", "0,5 d", "3-5 d", "Trigram, multi-entity, ranking"],
        ["REST API (OpenAPI 3.0)", "0,5 d", "8-10 d", "15+ endpoints, validatie, docs"],
        ["Linked Data (RDF, DCAT)", "0,5 d", "10-15 d", "Ontologie, 8 mappers, 3 formaten"],
        ["Begrippen (live SKOSMOS)", "0,5 d", "5-7 d", "API, caching, tooltip, config"],
        ["Admin panel (10+ secties)", "1 d", "10-15 d", "Beheer, sync, audit, deploy"],
        ["Kaart Nederland", "0,5 d", "3-5 d", "SVG, interactief, selectie"],
        ["Data-import (CSV/Excel)", "0,5 d", "5-8 d", "Parsers, validatie, mapping"],
        ["UX polish (diverse)", "0,5 d", "5-8 d", "Skeletons, shortcuts, RSS, print"],
        ["Styling & responsive", "1 d", "8-10 d", "Tailwind, dark mode, mobile"],
        ["Testen & bugfixes", "doorl.", "15-20 d", "Unit, e2e, edge cases"],
        ["Documentatie", "0,5 d", "5-8 d", "API docs, draaiboek, prompt"],
    ]

    col_widths = [155, 40, 50, 210]
    t = Table(table_data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        # Header
        ("BACKGROUND", (0,0), (-1,0), VNG_BLUE),
        ("TEXTCOLOR", (0,0), (-1,0), WHITE),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,0), 9),
        ("ALIGN", (1,0), (2,-1), "CENTER"),
        # Body
        ("FONTNAME", (0,1), (-1,-1), "Helvetica"),
        ("FONTSIZE", (0,1), (-1,-1), 8),
        ("TEXTCOLOR", (0,1), (-1,-1), DARK),
        # Alternating rows
        *[("BACKGROUND", (0,i), (-1,i), LIGHT_GRAY) for i in range(2, len(table_data), 2)],
        ("BACKGROUND", (0,1), (-1,1), WHITE),
        # Grid
        ("GRID", (0,0), (-1,-1), 0.5, HexColor("#cccccc")),
        ("LINEBELOW", (0,0), (-1,0), 1.5, VNG_BLUE),
        # Padding
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
    ]))
    story.append(t)

    # Summary comparison
    story.append(Paragraph("4. Totaalvergelijking", h1))

    summary_data = [
        ["", "AI-ondersteund", "Klassiek", "Factor"],
        ["Doorlooptijd", "10-12 werkdagen", "120-170 werkdagen", "12-15x"],
        ["Kalenderperiode", "2-2,5 weken", "6-8 maanden", ""],
        ["Teamgrootte", "1 persoon + AI", "2-3 ontwikkelaars", ""],
        ["Kosten (indicatief)", "ca. 10.000-12.000", "ca. 115.000-165.000", "12-15x"],
    ]

    st = Table(summary_data, colWidths=[110, 120, 130, 60])
    st.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), VNG_BLUE),
        ("TEXTCOLOR", (0,0), (-1,0), WHITE),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,0), 10),
        ("FONTNAME", (0,1), (0,-1), "Helvetica-Bold"),
        ("FONTNAME", (1,1), (-1,-1), "Helvetica"),
        ("FONTSIZE", (0,1), (-1,-1), 10),
        ("TEXTCOLOR", (0,1), (-1,-1), DARK),
        ("BACKGROUND", (3,1), (3,1), HexColor("#e6f4e6")),
        ("BACKGROUND", (3,4), (3,4), HexColor("#e6f4e6")),
        ("FONTNAME", (3,1), (3,-1), "Helvetica-Bold"),
        ("TEXTCOLOR", (3,1), (3,-1), HexColor("#2d7d2d")),
        ("ALIGN", (1,0), (-1,-1), "CENTER"),
        ("GRID", (0,0), (-1,-1), 0.5, HexColor("#cccccc")),
        ("LINEBELOW", (0,0), (-1,0), 1.5, VNG_BLUE),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(st)

    # Important note
    story.append(Spacer(1, 16))
    story.append(Paragraph("5. Essentiële kanttekening", h1))
    story.append(Paragraph(
        "<b>AI versnelt enorm, maar vervangt geen expertise.</b> De productiviteitswinst van factor 12-15x "
        "is alleen mogelijk door de combinatie van AI-tooling met diepgaande domeinkennis. "
        "Zonder die kennis produceert AI code die technisch werkt maar functioneel niet klopt.",
        body))

    story.append(Spacer(1, 8))
    story.append(Paragraph("De volgende expertisegebieden waren essentieel:", body))

    expertise = [
        ["Expertisegebied", "Toepassing in dit project"],
        ["Architectuur", "Gelaagdheid, API design, scheiding van concerns, MIM-conformiteit"],
        ["Standaarden", "NL-SBB, SKOS, DCAT, Linked Data, OpenAPI 3.0, GEMMA"],
        ["Gemeentelijk domein", "Softwarecatalogus, referentiecomponenten, compliancy, BIO"],
        ["UX / Usability", "Navigatiestructuur, demo-opbouw, gebruikersrollen, toegankelijkheid"],
        ["Non-functionals", "Privacy (anonimisatie), security, schaalbaarheid, caching, performance"],
        ["Softwareontwikkeling", "TypeScript, React, Next.js, Prisma, PostgreSQL, Vercel"],
    ]

    et = Table(expertise, colWidths=[120, 335])
    et.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), VNG_BLUE),
        ("TEXTCOLOR", (0,0), (-1,0), WHITE),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,0), 9),
        ("FONTNAME", (0,1), (0,-1), "Helvetica-Bold"),
        ("FONTNAME", (1,1), (-1,-1), "Helvetica"),
        ("FONTSIZE", (0,1), (-1,-1), 9),
        ("TEXTCOLOR", (0,1), (-1,-1), DARK),
        *[("BACKGROUND", (0,i), (-1,i), LIGHT_GRAY) for i in range(2, len(expertise), 2)],
        ("GRID", (0,0), (-1,-1), 0.5, HexColor("#cccccc")),
        ("LINEBELOW", (0,0), (-1,0), 1.5, VNG_BLUE),
        ("TOPPADDING", (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
    ]))
    story.append(Spacer(1, 6))
    story.append(et)

    # Conclusion
    story.append(Spacer(1, 12))
    story.append(Paragraph("6. Conclusie", h1))
    story.append(Paragraph(
        "De VNG Voorzieningencatalogus is een volledig functionele webapplicatie met 70+ routes, "
        "20+ datamodellen, REST API, Linked Data publicatie, AI-adviseur, en uitgebreid admin panel. "
        "De realisatie in circa 10-12 werkdagen door 1 persoon met AI-ondersteuning "
        "is een factor 12-15x sneller dan een klassieke aanpak.",
        body))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Deze versnelling is het resultaat van de synergie tussen AI-tooling en menselijke expertise. "
        "AI genereert code op hoog tempo; de architect stuurt op kwaliteit, samenhang en domeinlogica. "
        "Zonder die sturing levert AI kwantiteit zonder kwaliteit. "
        "Met die sturing levert het een productierijp platform in een fractie van de gebruikelijke tijd.",
        body))

    story.append(Spacer(1, 20))
    story.append(Paragraph(
        "<i>ArchiXL - maart 2026</i>",
        ParagraphStyle("Footer", parent=small, alignment=TA_CENTER, textColor=GRAY)))

    doc.build(story)
    print("PDF gegenereerd: docs/Tijdsinvestering AI vs Klassiek.pdf")

if __name__ == "__main__":
    build_pdf()
