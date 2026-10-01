# Eintrag

Statische Vite-Webseite im Darkmode. Alle Eingaben werden ausschließlich im Browser verarbeitet.

## Lokal starten

Unter Windows: `Starten.cmd` doppelklicken und die angezeigte Adresse im Browser öffnen. In diesem Arbeitsordner verwendet das Skript die heruntergeladene portable Node.js-Version aus `.tools/`. Auf anderen Geräten wird eine installierte Node.js-Version benötigt.

Mit Node.js 24 LTS im Projektordner:

```sh
npm install
npm run dev
```

Die im Terminal angezeigte Adresse öffnen. Die index.html wird bei Vite über den lokalen Server geöffnet, nicht mehr per Doppelklick.

```sh
npm run build
npm run preview
```

Der Build erzeugt die fertige statische Webseite in `dist/`.

## GitHub Pages

1. Projektdateien inklusive `package-lock.json` und `.github/workflows/deploy.yml` in ein GitHub-Repository auf den Branch `main` hochladen. `node_modules`, `.tools`, `.openai` und `dist` nicht hochladen.
2. Im Repository unter **Settings → Pages → Build and deployment → Source** die Option **GitHub Actions** wählen.
3. Den Workflow unter **Actions → Deploy to GitHub Pages → Run workflow** starten. Weitere Pushes auf `main` veröffentlichen automatisch.

Bei anderem Hauptbranch `branches: [main]` im Workflow anpassen. Relative Asset-Pfade unterstützen sowohl Repository-Unterordner als auch eigene Domains. Ein Repository oder eine Veröffentlichung wird durch das lokale Einrichten noch nicht erstellt.

## Funktionen

- Vorlagenwahl: Standard (beim Öffnen vorausgewählt), Abteilungsarbeit, In Ausbildung und Luftrettung mit den jeweils passenden Eingabefeldern.
- Beim Vorlagenwechsel bleiben die aktuellen Eingaben und Zeiten erhalten. Die zusätzlichen Angaben werden nur für den geöffneten Tab gehalten.
- Name und Reisepassnummer lokal speichern; durch Leeren der Felder entfernen.
- Eintragungszeit beim ersten Tippen oder Laden gespeicherter Angaben festhalten.
- Alten Eintrag oder eine Uhrzeit einfügen, um die Eintragungszeit zu korrigieren.
- Beim Austragen die aktuelle Zeit festhalten und den Text für Discord in `~~` einschließen.
- Uhrzeiten ohne Sekunden und Kopieren des fertigen Texts.

Gespeicherte Angaben gehören zur jeweiligen Browseradresse. Beim Wechsel von der lokalen Datei zu localhost oder GitHub Pages müssen sie einmal neu eingegeben werden. Uhrzeiten und Austragungsstatus werden nicht gespeichert.
