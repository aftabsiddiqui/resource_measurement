import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [data, setData] = useState([]);
  const [rir, setRir] = useState("apnic");
  const [country, setCountry] = useState("PK");
  const [yearStart, setYearStart] = useState("2024");
  const [yearEnd, setYearEnd] = useState("2025");
  const [summary, setSummary] = useState({});
  const [delegatedPrefixes, setDelegatedPrefixes] = useState({});
  const [prefixStatuses, setPrefixStatuses] = useState({});
  const [totalSummary, setTotalSummary] = useState({
    asn: 0,
    ipv4: 0,
    ipv6: 0,
  });
  const [showTable, setShowTable] = useState(false);
  const [showASN, setShowASN] = useState(true);
  const [showIPv4, setShowIPv4] = useState(true);
  const [showIPv6, setShowIPv6] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/delegatedstats`)
      .then((res) => res.json())
      .then((json) => {
        // Convert backend JSON to array format expected by process()
        const parsed = json.map(row => [row.rir, row.country, row.type, row.value, row.size, row.date ? String(row.date).substring(0,8) : "", row.status, row.entity]);
        setData(parsed);
      });
  }, []);

  const process = () => {
    const prefixMap = {};
    if (!data || data.length === 0) return;
    const start = parseInt(yearStart);
    const end = parseInt(yearEnd);

    const entitiesInRange = new Set();
    const allDelegations = {};
    const priorFlags = {};

    data.forEach((row) => {
      const [r, cc, type, value, size, date, status, entity] = row;
      if (r !== rir.toLowerCase() || cc !== country.toUpperCase()) return;
      const y = parseInt(date.substring(0, 4));
      if (y >= start && y <= end) entitiesInRange.add(entity);
    });

    data.forEach((row) => {
      const [r, cc, type, value, size, date, status, entity] = row;
      if (!entitiesInRange.has(entity)) return;
      const y = parseInt(date.substring(0, 4));
      allDelegations[entity] = allDelegations[entity] || {
        asn: 0,
        ipv4: 0,
        ipv6: 0,
      };
      priorFlags[entity] = priorFlags[entity] || {
        asn: false,
        ipv4: false,
        ipv6: false,
      };

      if (type === "asn") {
        allDelegations[entity].asn += parseInt(size);
        if (y < start) priorFlags[entity].asn = true;
      } else if (type === "ipv4") {
        allDelegations[entity].ipv4 += 1;
        prefixMap[entity] = prefixMap[entity] || { ipv4: [], ipv6: [] };
        prefixMap[entity].ipv4.push(
          `${value}/${Math.log2(256 / parseInt(size))}`
        );
        if (y < start) priorFlags[entity].ipv4 = true;
      } else if (type === "ipv6") {
        allDelegations[entity].ipv6 += 1;
        if (y < start) priorFlags[entity].ipv6 = true;
        prefixMap[entity] = prefixMap[entity] || { ipv4: [], ipv6: [] };
        prefixMap[entity].ipv6.push(`${value}/${size}`);
      }
    });

    const result = {};
    Object.entries(allDelegations).forEach(([ent, vals]) => {
      result[ent] = {
        asn: `${vals.asn}${priorFlags[ent].asn ? "*" : ""}`,
        ipv4: `${vals.ipv4}${priorFlags[ent].ipv4 ? "*" : ""}`,
        ipv6: `${vals.ipv6}${priorFlags[ent].ipv6 ? "*" : ""}`,
        hasPrior: Object.values(priorFlags[ent]).some(Boolean),
      };
    });

    setSummary(result);
    setDelegatedPrefixes(prefixMap);
    setShowTable(false);

    // Total summary
    const totals = { asn: 0, ipv4: 0, ipv6: 0 };
    Object.values(result).forEach((vals) => {
      totals.asn += parseInt(vals.asn);
      totals.ipv4 += parseInt(vals.ipv4);
      totals.ipv6 += parseInt(vals.ipv6);
    });
    setTotalSummary(totals);
  };

  const generateChartData = () => {
    const labels = Object.keys(summary).map((entity) =>
      summary[entity].hasPrior ? `${entity}*` : entity
    );
    const asnData = [],
      ipv4Data = [],
      ipv6Data = [];

    labels.forEach((entityLabel, idx) => {
      const entityKey = Object.keys(summary)[idx];
      const entry = summary[entityKey];
      asnData.push(parseInt(entry.asn));
      ipv4Data.push(parseInt(entry.ipv4));
      ipv6Data.push(parseInt(entry.ipv6));
    });

    const datasets = [];
    if (showASN) {
      datasets.push({
        label: "ASN",
        data: asnData,
        backgroundColor: "#4e79a7",
      });
    }
    if (showIPv4) {
      datasets.push({
        label: "IPv4 Delegations",
        data: ipv4Data,
        backgroundColor: "#f28e2b",
      });
    }
    if (showIPv6) {
      datasets.push({
        label: "IPv6 (/48s)",
        data: ipv6Data,
        backgroundColor: "#59a14f",
      });
    }

    return { labels, datasets };
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>RIR Delegation Summary</h1>
      <div>
        <label>
          RIR: <input value={rir} onChange={(e) => setRir(e.target.value)} />
        </label>
        <label style={{ marginLeft: "10px" }}>
          Country:{" "}
          <input value={country} onChange={(e) => setCountry(e.target.value)} />
        </label>
        <label style={{ marginLeft: "10px" }}>
          Start Year:{" "}
          <input
            value={yearStart}
            onChange={(e) => setYearStart(e.target.value)}
          />
        </label>
        <label style={{ marginLeft: "10px" }}>
          End Year:{" "}
          <input value={yearEnd} onChange={(e) => setYearEnd(e.target.value)} />
        </label>
        <button style={{ marginLeft: "10px" }} onClick={process}>
          Process
        </button>
        <button
          style={{ marginLeft: "10px" }}
          onClick={() => setShowTable(!showTable)}
        >
          {showTable ? "Hide Table" : "Show Table"}
        </button>
      </div>

      <div style={{ marginTop: "10px" }}>
        <label>
          <input
            type="checkbox"
            checked={showASN}
            onChange={() => setShowASN(!showASN)}
          />{" "}
          ASN
        </label>
        <label style={{ marginLeft: "10px" }}>
          <input
            type="checkbox"
            checked={showIPv4}
            onChange={() => setShowIPv4(!showIPv4)}
          />{" "}
          IPv4
        </label>
        <label style={{ marginLeft: "10px" }}>
          <input
            type="checkbox"
            checked={showIPv6}
            onChange={() => setShowIPv6(!showIPv6)}
          />{" "}
          IPv6
        </label>
      </div>

      {Object.keys(summary).length > 0 && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#eef",
            border: "1px solid #ccc",
          }}
        >
          <strong>Delegation Summary</strong>
          <br />
          Total ASN Delegations: {totalSummary.asn}
          <br />
          Total IPv4 Delegations: {totalSummary.ipv4}
          <br />
          Total IPv6 Delegations: {totalSummary.ipv6}
        </div>
      )}

      {Object.keys(summary).length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h2>Entity Delegation Overview</h2>
          <Bar
            data={generateChartData()}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Delegated Resources by Entity" },
                tooltip: { mode: "index", intersect: false },
              },
              scales: {
                x: {
                  stacked: true,
                  ticks: { display: false },
                },
                y: { stacked: true },
              },
            }}
          />

          {showTable && (
            <table border="1" cellPadding="5" style={{ marginTop: "20px" }}>
              <thead>
                <tr>
                  <th>Entity</th>
                  <th>ASNs</th>
                  <th>IPv4 Delegations</th>
                  <th>IPv6 Blocks</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary).map(([ent, vals]) => (
                  <tr key={ent}>
                    <td>
                      {ent}
                      {vals.hasPrior ? "*" : ""}
                    </td>
                    <td>{vals.asn}</td>
                    <td>{vals.ipv4}</td>
                    <td>{vals.ipv6}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

// Note: Routing visibility check functionality will be implemented next using delegatedPrefixes
