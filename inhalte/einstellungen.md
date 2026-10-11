# Einstellungen

<!--
  Hier stellst du Zahlen und Namen ein, ohne programmieren zu müssen.
  Nach jeder Änderung:  python3 build.py
-->

<!-- Ab wie viel Prozent gilt ein Modulcheck als bestanden? -->
bestehensgrenze: 80

<!-- Wie viele Aufgaben zieht ein Modulcheck zufällig? -->
modulcheck_aufgaben: 12

<!-- Ab wie viel Prozent der Selbstcheck-Kriterien gilt eine Operatoraufgabe als bestanden? -->
operator_bestehensgrenze: 60

<!-- Dauer einer Runde im Quiz auf Zeit und im Enzym-Spiel (Sekunden): -->
quiz_sekunden: 90
enzym_sekunden: 60

<!-- XP pro Aktion. Format:  - aktion => Punkte  (die Namen links nicht ändern) -->
xp:
- richtige_aufgabe => 10
- modul_bestanden => 50
- modul_erstmals_bestanden => 100
- karte_weiter => 2
- operator_bestanden => 30
- quiz_richtig => 5
- enzym_treffer => 1
- trakt_geschafft => 20
- award => 25

<!-- Ränge. Format:  - ab XP => weiblich / männlich / neutral -->
raenge:
- 0 => Praktikantin / Praktikant / Praktikant:in
- 150 => Famulantin / Famulant / Famulant:in
- 400 => PJlerin / PJler / PJler:in
- 800 => Assistenzärztin / Assistenzarzt / Assistenzärzt:in
- 1400 => Oberärztin / Oberarzt / Oberärzt:in
- 2200 => Chefärztin / Chefarzt / Chefärzt:in
- 3200 => Gesundheitsministerin / Gesundheitsminister / Gesundheitsminister:in

<!-- Blöcke. Format:  - Nummer => Titel -->
bloecke:
- 1 => Grundlagen
- 2 => Organe
- 3 => Physiologie
- 4 => Erkrankungen
