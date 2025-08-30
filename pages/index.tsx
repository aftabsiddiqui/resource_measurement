import React, { useState, useEffect } from "react";
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
import Head from 'next/head';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SummaryData {
  asn: string;
  ipv4: string;
  ipv6: string;
  hasPrior: boolean;
}

interface TotalSummary {
  asn: number;
  ipv4: number;
  ipv6: number;
}

interface PrefixMap {
  [entity: string]: {
    ipv4: string[];
    ipv6: string[];
  };
}

export default function Home() {
  const [rir, setRir] = useState("apnic");
  const [country, setCountry] = useState("PK");
  const [yearStart, setYearStart] = useState("2024");
  const [yearEnd, setYearEnd] = useState("2025");
  const [summary, setSummary] = useState<Record<string, SummaryData>>({});
  const [delegatedPrefixes, setDelegatedPrefixes] = useState<PrefixMap>({});
  const [totalSummary, setTotalSummary] = useState<TotalSummary>({
    asn: 0,
    ipv4: 0,
    ipv6: 0,
  });
  const [showTable, setShowTable] = useState(false);
  const [showASN, setShowASN] = useState(true);
  const [showIPv4, setShowIPv4] = useState(true);
  const [showIPv6, setShowIPv6] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [dataStatus, setDataStatus] = useState<string>("Checking data status...");

  // Check data status on component mount
  useEffect(() => {
    checkDataStatus();
  }, []);

  const checkDataStatus = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Try to get data directly - this will trigger initialization if needed
      const response = await fetch('/api/delegations?rir=ARIN&country=US&yearStart=2024&yearEnd=2024', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        setDataStatus(`Data ready (${result.data.length} records available)`);
      } else {
        setDataStatus("Server ready - fetching data in background");
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setDataStatus("Data service timeout - retrying...");
      } else {
        setDataStatus("Server starting up...");
      }
    }
  };

  const fetchDelegationData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const params = new URLSearchParams({
        rir,
        country,
        yearStart,
        yearEnd
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`/api/delegations?${params}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      setSummary(result.data.summary);
      setTotalSummary(result.data.totalSummary);
      setDelegatedPrefixes(result.data.delegatedPrefixes);
      setShowTable(false);

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timeout: The operation is taking too long. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
      console.error('Error fetching delegation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const process = () => {
    fetchDelegationData();
  };

  const generateChartData = () => {
    const labels = Object.keys(summary).map((entity) =>
      summary[entity].hasPrior ? `${entity}*` : entity
    );
    const asnData: number[] = [],
      ipv4Data: number[] = [],
      ipv6Data: number[] = [];

    labels.forEach((entityLabel, idx) => {
      const entityKey = Object.keys(summary)[idx];
      const entry = summary[entityKey];
      asnData.push(parseInt(entry.asn));
      ipv4Data.push(parseInt(entry.ipv4));
      ipv6Data.push(parseInt(entry.ipv6));
    });

    const datasets: any[] = [];
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
    <>
      <Head>
        <title>RIR Delegation Summary - Resource Measurement</title>
        <meta name="description" content="RIR delegation summary and resource measurement tool" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div style={{ padding: "20px" }}>
        <h1>RIR Delegation Summary</h1>
        
        {/* Data Status */}
        <div style={{ 
          marginBottom: "20px", 
          padding: "10px", 
          backgroundColor: "#f8f9fa", 
          border: "1px solid #dee2e6",
          borderRadius: "4px"
        }}>
          <div style={{ fontSize: "14px", color: "#28a745", fontStyle: "italic" }}>
            Status: {dataStatus}
          </div>
          <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "5px" }}>
            Data is automatically updated daily. The system fetches the latest delegation records in the background.
          </div>
        </div>

        {/* Query Parameters */}
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
          <button 
            style={{ 
              marginLeft: "10px",
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }} 
            onClick={process}
            disabled={loading}
          >
            {loading ? "Processing..." : "Process"}
          </button>
          <button
            style={{ 
              marginLeft: "10px",
              padding: "8px 16px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
            onClick={() => setShowTable(!showTable)}
          >
            {showTable ? "Hide Table" : "Show Table"}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "4px",
            color: "#721c24"
          }}>
            Error: {error}
          </div>
        )}

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
                  legend: { position: "top" as const },
                  title: { display: true, text: "Delegated Resources by Entity" },
                  tooltip: { mode: "index" as const, intersect: false },
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
              <table style={{ marginTop: "20px", border: "1px solid #ccc", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ccc", padding: "5px" }}>Entity</th>
                    <th style={{ border: "1px solid #ccc", padding: "5px" }}>ASNs</th>
                    <th style={{ border: "1px solid #ccc", padding: "5px" }}>IPv4 Delegations</th>
                    <th style={{ border: "1px solid #ccc", padding: "5px" }}>IPv6 Blocks</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary).map(([ent, vals]) => (
                    <tr key={ent}>
                      <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                        {ent}
                        {vals.hasPrior ? "*" : ""}
                      </td>
                      <td style={{ border: "1px solid #ccc", padding: "5px" }}>{vals.asn}</td>
                      <td style={{ border: "1px solid #ccc", padding: "5px" }}>{vals.ipv4}</td>
                      <td style={{ border: "1px solid #ccc", padding: "5px" }}>{vals.ipv6}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Note: Routing visibility check functionality will be implemented next using delegatedPrefixes
