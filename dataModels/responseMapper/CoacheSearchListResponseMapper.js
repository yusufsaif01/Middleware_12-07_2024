class coacheSearchListResponseMapper {
  map(members) {
    let response = [];
    if (members.length) {
      members.forEach((member) => {
        if (member.coache_detail) {
          let data = {
            user_id: member.coache_detail.user_id,
            avatar: member.coache_detail.avatar_url || "-",
            email: member.coache_detail.email,
            name:
              (member.coache_detail.first_name || "") +
              " " +
              (member.coache_detail.last_name || ""),
            member_type: member.coache_detail.member_type,
            category: member.coache_detail.player_type || "-",
            position: "-",
            is_verified: member.coache_detail.is_verified || false,
            status: member.coache_detail.status || null,
          };
          data.name =
            String(data.name).trim().length > 0
              ? String(data.name).trim()
              : "-";

          if (
            member.coache_detail.position &&
            member.coache_detail.position.length > 0 &&
            member.coache_detail.position[0] &&
            member.coache_detail.position[0].name
          ) {
            data.position = member.coache_detail.position[0].name;
          }
          if (member.coache_detail.club_name) {
            data.club_name = member.coache_detail.club_name;
          }
          response.push(data);
        }
        if (member.club_academy_detail) {
          let data = {
            user_id: member.club_academy_detail.user_id,
            avatar: member.club_academy_detail.avatar_url || "-",
            email: member.club_academy_detail.email,
            name: member.club_academy_detail.name,
            member_type: member.club_academy_detail.member_type,
            category: member.club_academy_detail.type || "-",
            position: "",
            is_verified: member.club_academy_detail.is_verified || false,
          };
          response.push(data);
        }
      });
    }
    return response;
  }
}

module.exports = coacheSearchListResponseMapper;
