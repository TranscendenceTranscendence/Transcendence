import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Achievement } from "@/generated-api";
import { formatDate } from "@/utils/formatters/date";

interface AchievementBoxProps {
  achievements: Achievement[];
}

export const AchievementBox = ({ achievements }: AchievementBoxProps) => {
  return (
    <Card className="rounded-xl h-full">
      <CardHeader className="pb-2">
        <div className="flex flex-row justify-between items-center gap-2">
          <p className="font-bold text-3xl">ACHIEVEMENTS</p>
        </div>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 && (
          <p className="text-sm text-gray-600">No achievements yet :(</p>
        )}
        <div className="grid grid-cols-1 gap-2 max-h-[264px] overflow-y-auto">
          {achievements.map((achievement) => (
            <div
              key={achievement.userId + achievement.type}
              className="flex items-center gap-4 px-3 py-2 rounded-lg bg-white/50"
            >
              <div>
                <p className="font-bold text-sm">{achievement.type}</p>
                <p className="text-xs text-gray-600">
                  {formatDate(achievement.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
