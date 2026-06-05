// ⚠️ PLANTILLA VACÍA — Este archivo será reemplazado por el scraper cuando comience el Mundial 2026.
// El workflow de GitHub Actions (update-results.yml) scrapea Wikipedia y sobrescribe este archivo
// con los resultados reales de cada jornada.
// Mientras no haya datos reales, la app funciona en modo "sin resultados" (puntuaciones a 0).
const RESULTS = {
  groups: {},
  thirdPlace: [],
  groupMatches: {},

  knockout: {
    round32: [],
    round16: [],
    quarterfinals: [],
    semifinals: [],

    champion: "",
    runnerUp: "",
    finalists: [],

    thirdPlaceWinner: "",
    final: "",
    thirdPlace: "",

    matches: {
      round32: [],
      round16: [],
      quarterfinals: [],
      semifinals: [],
      thirdPlace: [],
      final: [],
    },
  },

  semifinalists: [],
  finalists: [],

  champion: "",
  runnerUp: "",
  thirdPlaceWinner: "",

  awards: {
    goldenBoot: [],
    goldenBall: [],
  },
};
