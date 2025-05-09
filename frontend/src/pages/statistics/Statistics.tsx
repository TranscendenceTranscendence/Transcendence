import React, { useEffect, useState } from "react";
import { useApi } from "@/utils/api";
import { PlayerStatisticsDto } from "@/generated-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Statistics() {
  const [stats, setStats] = useState<PlayerStatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  useEffect(() => {
    async function fetchStatistics() {
      try {
        setLoading(true);
        const response =
          await api.Statistics.statisticsControllerGetCurrentPlayerStatistics();
        setStats(response);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch statistics:", err);
        setError("Could not load statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchStatistics();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Game Statistics</h1>

      {loading && <div className="text-center py-8">Loading statistics...</div>}

      {error && <div className="text-red-500 text-center py-8">{error}</div>}

      {!loading && !error && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <StatItem label="Total Games" value={stats.totalGames} />
                <StatItem label="Games Won" value={stats.gamesWon} />
                <StatItem label="Games Lost" value={stats.gamesLost} />
                <StatItem
                  label="Win Rate"
                  value={`${stats.winPercentage.toFixed(1)}%`}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scoring Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <StatItem label="Total Points" value={stats.totalPoints} />
                <StatItem
                  label="Avg. Points Per Game"
                  value={stats.averagePointsPerGame.toFixed(1)}
                />
                <StatItem
                  label="Longest Win Streak"
                  value={stats.longestWinStreak}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && !error && !stats && (
        <div className="text-center py-8">
          <p className="text-lg mb-4">You havent played any games yet!</p>
          <p>Play some games to see your statistics here.</p>
        </div>
      )}
    </div>
  );
}

const StatItem = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-2xl font-semibold">{value}</span>
  </div>
);
