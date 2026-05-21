const fs = require("fs");
const path = require("path");

const TP_COLUMNS = [79, 85, 81, 74, 82, 77, 87, 80];
const TP_TABLE = {
  "ABCDEFGH": ["3H", "3G", "3B", "3C", "3A", "3F", "3D", "3E"],
  "ABCDEFGI": ["3C", "3G", "3B", "3D", "3A", "3F", "3E", "3I"],
  "ABCDEFGJ": ["3C", "3G", "3B", "3D", "3A", "3F", "3E", "3J"],
  "ABCDEFGK": ["3C", "3G", "3B", "3D", "3A", "3F", "3E", "3K"],
  "ABCDEFGL": ["3C", "3G", "3B", "3D", "3A", "3F", "3L", "3E"],
  "ABCDEFHI": ["3H", "3E", "3B", "3C", "3A", "3F", "3D", "3I"],
  "ABCDEFHJ": ["3H", "3J", "3B", "3C", "3A", "3F", "3D", "3E"],
  "ABCDEFHK": ["3H", "3E", "3B", "3C", "3A", "3F", "3D", "3K"],
  "ABCDEFHL": ["3H", "3F", "3B", "3C", "3A", "3D", "3L", "3E"],
  "ABCDEFIJ": ["3C", "3J", "3B", "3D", "3A", "3F", "3E", "3I"],
  "ABCDEFIK": ["3C", "3E", "3B", "3D", "3A", "3F", "3I", "3K"],
  "ABCDEFIL": ["3C", "3E", "3B", "3D", "3A", "3F", "3L", "3I"],
  "ABCDEFJK": ["3C", "3J", "3B", "3D", "3A", "3F", "3E", "3K"],
  "ABCDEFJL": ["3C", "3J", "3B", "3D", "3A", "3F", "3L", "3E"],
  "ABCDEFKL": ["3C", "3E", "3B", "3D", "3A", "3F", "3L", "3K"],
  "ABCDEGHI": ["3H", "3G", "3B", "3C", "3A", "3D", "3E", "3I"],
  "ABCDEGHJ": ["3H", "3G", "3B", "3C", "3A", "3D", "3E", "3J"],
  "ABCDEGHK": ["3H", "3G", "3B", "3C", "3A", "3D", "3E", "3K"],
  "ABCDEGHL": ["3H", "3G", "3B", "3C", "3A", "3D", "3L", "3E"],
  "ABCDEGIJ": ["3E", "3G", "3B", "3C", "3A", "3D", "3I", "3J"],
  "ABCDEGIK": ["3E", "3G", "3B", "3C", "3A", "3D", "3I", "3K"],
  "ABCDEGIL": ["3E", "3G", "3B", "3C", "3A", "3D", "3L", "3I"],
  "ABCDEGJK": ["3E", "3G", "3B", "3C", "3A", "3D", "3J", "3K"],
  "ABCDEGJL": ["3E", "3G", "3B", "3C", "3A", "3D", "3L", "3J"],
  "ABCDEGKL": ["3E", "3G", "3B", "3C", "3A", "3D", "3L", "3K"],
  "ABCDEHIJ": ["3H", "3J", "3B", "3C", "3A", "3D", "3E", "3I"],
  "ABCDEHIK": ["3H", "3E", "3B", "3C", "3A", "3D", "3I", "3K"],
  "ABCDEHIL": ["3H", "3E", "3B", "3C", "3A", "3D", "3L", "3I"],
  "ABCDEHJK": ["3H", "3J", "3B", "3C", "3A", "3D", "3E", "3K"],
  "ABCDEHJL": ["3H", "3J", "3B", "3C", "3A", "3D", "3L", "3E"],
  "ABCDEHKL": ["3H", "3E", "3B", "3C", "3A", "3D", "3L", "3K"],
  "ABCDEIJK": ["3E", "3J", "3B", "3C", "3A", "3D", "3I", "3K"],
  "ABCDEIJL": ["3E", "3J", "3B", "3C", "3A", "3D", "3L", "3I"],
  "ABCDEIKL": ["3E", "3I", "3B", "3C", "3A", "3D", "3L", "3K"],
  "ABCDEJKL": ["3E", "3J", "3B", "3C", "3A", "3D", "3L", "3K"],
  "ABCDFGHI": ["3H", "3G", "3B", "3C", "3A", "3F", "3D", "3I"],
};

const KNOCKOUT_MATCH_NUMS = {
  round32: [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88],
  round16: [89, 90, 91, 92, 93, 94, 95, 96],
  quarterfinals: [97, 98, 99, 100],
  semifinals: [101, 102],
  thirdPlace: [103],
  final: [104],
};

function getFifaRanking(team) {
  const rankings = {
    Argentina: 1, France: 2, Spain: 3, England: 4, Brazil: 5,
    Portugal: 6, Netherlands: 7, Belgium: 8, Germany: 9, Croatia: 10,
    Morocco: 11, Colombia: 12, Uruguay: 13, Mexico: 14, USA: 15,
    Senegal: 16, Japan: 17, Switzerland: 18, Iran: 19, "South Korea": 20,
    Austria: 21, Australia: 22, Qatar: 23, Norway: 24, Ecuador: 25,
    Turkey: 26, Canada: 27, Sweden: 28, Panama: 29, Egypt: 30,
    Algeria: 31, Tunisia: 32, Paraguay: 33, "Ivory Coast": 34,
    "Saudi Arabia": 35, Scotland: 36, "Bosnia & Herzegovina": 37,
    "Czech Republic": 38, Iraq: 39, Uzbekistan: 40, Jordan: 41,
    "DR Congo": 42, "South Africa": 43, "Cape Verde": 44,
    "New Zealand": 45, Haiti: 46, "Curaçao": 47,
  };
  return rankings[team] ?? 999;
}

function calculateGroupStandings(group, matches, teams) {
  const stats = {};
  const playedMatches = [];

  for (const team of teams) {
    stats[team] = { team, pts: 0, gf: 0, ga: 0, gd: 0, played: 0, wins: 0 };
  }

  for (const [key, result] of Object.entries(matches[group] || {})) {
    const [t1, t2] = key.split("__");
    if (!stats[t1] || !stats[t2]) continue;
    const home = result.home;
    const away = result.away;

    stats[t1].played++;
    stats[t2].played++;
    stats[t1].gf += home;
    stats[t1].ga += away;
    stats[t2].gf += away;
    stats[t2].ga += home;
    stats[t1].gd = stats[t1].gf - stats[t1].ga;
    stats[t2].gd = stats[t2].gf - stats[t2].ga;

    if (home > away) { stats[t1].pts += 3; stats[t1].wins++; }
    else if (away > home) { stats[t2].pts += 3; stats[t2].wins++; }
    else { stats[t1].pts += 1; stats[t2].pts += 1; }

    playedMatches.push({ team1: t1, team2: t2, home, away });
  }

  return [...Object.values(stats)].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return getFifaRanking(a.team) - getFifaRanking(b.team);
  }).map(s => s.team);
}

function computeThirdPlaceTeams(matches, standings) {
  const thirdTeams = [];
  const groups = Object.keys(standings).filter(g => standings[g].length >= 4);

  for (const group of groups) {
    const third = standings[group][2];
    if (third) {
      thirdTeams.push({ group, team: third });
    }
  }

  if (thirdTeams.length < 8) return [];

  thirdTeams.sort((a, b) => {
    const aStats = getThirdStats(a.group, matches, standings);
    const bStats = getThirdStats(b.group, matches, standings);
    return (
      bStats.pts - aStats.pts ||
      bStats.gd - aStats.gd ||
      bStats.gf - aStats.gf ||
      getFifaRanking(a.team) - getFifaRanking(b.team)
    );
  });

  return thirdTeams.slice(0, 8).map(t => t.team);
}

function getThirdStats(group, matches, standings) {
  const stats = { pts: 0, gd: 0, gf: 0 };
  for (const [key, result] of Object.entries(matches[group] || {})) {
    const [t1, t2] = key.split("__");
    if (t1 !== standings[group][2] && t2 !== standings[group][2]) continue;
    const isHome = t1 === standings[group][2];
    const home = result.home;
    const away = result.away;
    if (isHome) {
      stats.gf += home;
      stats.gd += home - away;
      if (home > away) stats.pts += 3;
      else if (home === away) stats.pts += 1;
    } else {
      stats.gf += away;
      stats.gd += away - home;
      if (away > home) stats.pts += 3;
      else if (home === away) stats.pts += 1;
    }
  }
  return stats;
}

function generateResults(matches, standings, knockout) {
  const thirdPlace = computeThirdPlaceTeams(matches, standings);

  const results = {
    groups: {},
    thirdPlace: thirdPlace,
    groupMatches: matches,
    knockout: {
      round32: knockout?.round32Winners || [],
      round16: knockout?.round16Winners || [],
      quarterfinals: knockout?.quarterfinalsWinners || [],
      semifinals: knockout?.semifinalsWinners || [],
      champion: knockout?.champion || "",
      runnerUp: knockout?.runnerUp || "",
      finalists: knockout?.finalists || [],
      thirdPlaceWinner: knockout?.thirdPlaceWinner || "",
      final: knockout?.final || "",
      thirdPlace: knockout?.thirdPlace || "",
      matches: {
        round32: knockout?.round32 || [],
        round16: knockout?.round16 || [],
        quarterfinals: knockout?.quarterfinals || [],
        semifinals: knockout?.semifinals || [],
        thirdPlace: knockout?.thirdPlaceMatch || [],
        final: knockout?.finalMatch || [],
      },
    },
    semifinalists: knockout?.semifinalsWinners || [],
    finalists: knockout?.finalists || [],
    champion: knockout?.champion || "",
    runnerUp: knockout?.runnerUp || "",
    thirdPlaceWinner: knockout?.thirdPlaceWinner || "",
    awards: {
      goldenBoot: [],
      goldenBall: [],
    },
  };

  for (const g of Object.keys(standings)) {
    if (standings[g].length > 0) {
      results.groups[g] = standings[g];
    }
  }

  const outputPath = path.join(__dirname, "..", "results.js");
  const output = `const RESULTS = ${JSON.stringify(results, null, 2)};\n`;
  fs.writeFileSync(outputPath, output, "utf8");
  console.log(`Written results.js (${output.length} bytes)`);

  return results;
}

function computeStandingsFromMatches(matches, groupNames) {
  const standings = {};
  for (const group of groupNames) {
    const matchEntries = Object.entries(matches[group] || {});
    if (matchEntries.length === 0) continue;
    const teamSet = new Set();
    for (const [key] of matchEntries) {
      const [t1, t2] = key.split("__");
      teamSet.add(t1);
      teamSet.add(t2);
    }
    const teams = [...teamSet];
    const ordered = calculateGroupStandings(group, matches, teams);
    standings[group] = ordered;
  }
  return standings;
}

module.exports = { generateResults, computeStandingsFromMatches, KNOCKOUT_MATCH_NUMS };
