import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Achievement } from "@/generated-api";
import { useUser } from "@/utils/providers/UserProvider";

interface AchievementBoxProps {
  achievements: Achievement[];
}

export const AchievementBox = ({ achievements }: AchievementBoxProps) => {
  const me = useUser();

  return (
    <div className="row-span-3 w-full">
      <Card>
        <CardHeader>
          <p className="font-bold text-3xl">ACHIEVEMENTS</p>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 && (
            <p className="p-4 text-lg text-gray-600">No achievements yet :(</p>
          )}
          <div className="grid grid-cols-1 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.userId + achievement.type}
                className="flex items-center gap-4 p-4 rounded-lg"
              >
                <div>
                  <p className="font-bold text-xl">{achievement.type}</p>
                  <p className="text-lg text-gray-600">
                    {achievement.createdAt.toDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
