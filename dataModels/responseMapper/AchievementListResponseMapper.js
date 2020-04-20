
class AchievementListResponseMapper {
    map(achievements) {
        let response = [];
         if(achievements.length){
            achievements.forEach((achievement) => {
                let data = {
                            "type": achievement.type,
                            "name": achievement.name || "",
                            "year": achievement.year,
                            "position": achievement.position || "",
                            "image": achievement.mediaUrl || "",
                            "id": achievement.id
                };
                response.push(data);
            });
        }
        return response;
    }
}

module.exports = AchievementListResponseMapper;