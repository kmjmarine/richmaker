const { AppDataSource } = require("./dataSource");

const getMemberCount = async (groupId) => {
  try {
    const [{ memberCount }] = await AppDataSource.query(
      `select member_count as memberCount
            from groupings
            where id = ?`,
      [groupId]
    );
    return memberCount;
  } catch {
    const err = new Error("datasource error");
    err.statusCode = 400;
    throw err;
  }
};

const sendInvitation = async (userId, receiverId, status = 1) => {
  try {
    const { insertId } = await AppDataSource.query(
      `insert into invitations(inviter_id, receiver_id, status) values(?,?,?);`,
      [userId, receiverId, status]
    );
    return insertId;
  } catch {
    const err = new Error("datasource error");
    err.statusCode = 400;
    throw err;
  }
};

const getGroupById = async (userId) => {
  try {
    const [{ groupId }] = await AppDataSource.query(
      `select grouping_id as groupId
        from users
        where id = ?`,
      [userId]
    );
    return groupId;
  } catch {
    const err = new Error("datasource error");
    err.statusCode = 400;
    throw err;
  }
};

const addMember = async (userId, receiverId, groupId) => {
  try {
    if (groupId) {
      await AppDataSource.query(
        `update users
            set grouping_id = ?
            where id=?`,
        [groupId, receiverId]
      );
      await AppDataSource.query(
        `update groupings
            set member_count = member_count + 1
            where id = ?`,
        [groupId, receiverId, groupId]
      );
    } else {
      const { insertId } = await AppDataSource.query(
        `insert into groupings (member_count) value (2)`
      );
      await AppDataSource.query(
        `update users
            set grouping_id = ?
            where id=? or id = ?`,
        [insertId, userId, receiverId]
      );
    }
  } catch {
    const error = new Error("dataSource Error");
    error.statusCode = 400;
    throw error;
  }
};
const withdrawFromGroup = async (userId, groupId) => {
  try {
    await AppDataSource.query(
      `update user_finances
      set is_shared = 0
      where user_id = ?;
      `,
      [userId]
    );
    await AppDataSource.query(
      `
      update users
      set grouping_id = 0
      where id = ?;`,
      [userId]
    );
    await AppDataSource.query(
      `
      update groupings
      set member_count = member_count -1
      where id = ?;`,
      [groupId]
    );
  } catch {
    const error = new Error("dataSource Error");
    error.statusCode = 400;
    throw error;
  }
};

const withdrawThenRemoveGroup = async (groupId) => {
  try {
    await AppDataSource.query(
      `update user_finances
      set is_shared = 0
      where user_id IN (select id from users where grouping_id = ?);`,
      [groupId]
    );
    await AppDataSource.query(
      `
    update users
    set grouping_id = 0
    where grouping_id = ?;`,
      [groupId]
    );
    await AppDataSource.query(
      `
    delete from groupings where id = ?;`,
      [groupId]
    );
  } catch {
    const error = new Error("dataSource Error");
    error.statusCode = 400;
    throw error;
  }
};
const getFinanceDetail = async (financeId, filteringQuery = "") => {
  try {
    return await AppDataSource.query(
      `SELECT
    p.image_url as providerImage,
    p.provider_name as provider,
    uf.finance_number as financeNumber,
    c.image_url as categoryImage,
    day(t.created_at) as tDay,
    month(t.created_at) as tMonth,
    year(t.created_at) as tYear,
    t.transaction_note as note,
    t.amount
  FROM transactions t
  JOIN categories c ON t.category_id = c.id
  JOIN user_finances uf ON t.user_finances_id = uf.id
  JOIN providers p ON uf.provider_id = p.id
  where uf.id = ? ${filteringQuery}
  ORDER BY t.created_at DESC;`,
      [financeId]
    );
  } catch {
    const error = new Error("dataSource Error");
    error.statusCode = 400;
    throw error;
  }
};

const getMemberList = async (groupId) => {
  try {
    return await AppDataSource.query(
      `select u.id as userId, u.user_name as userName, u.profile_image as profileImage, SUM(case when uf.is_shared then 1 else 0 end) as sharedFinanceCount
        from users u
        LEFT join user_finances uf ON u.id = uf.user_id
        where u.grouping_id = ?
        GROUP BY u.id`,
      [groupId]
    );
  } catch {
    const error = new Error("dataSource Error");
    error.statusCode = 400;
    throw error;
  }
};

const getGroupFinanceManagement = async (
  groupId,
  amount = "",
  filterByMember,
  filterByMonth
) => {
  try {
    return await AppDataSource.query(
      `
    SELECT
    t.is_monthly,JSON_OBJECT(
     "tDate",date(t.created_at),
     "amount", t.amount,
     "userId", u.id,
    "userImage",u.profile_image,
    "provider",p.provider_name,
    "providerImage",p.image_url,
    "financeNumber",uf.finance_number,
    "category",c.category_name,
    "categoryImage" , c.image_url) as info
     FROM transactions t
     JOIN user_finances uf ON uf.id = t.user_finances_id
     JOIN providers p ON uf.provider_id = p.id
     JOIN users u ON u.id = uf.user_id
     JOIN categories c on c.id = t.category_id
     WHERE u.grouping_id = ? AND uf.is_shared = 1 ${amount}${filterByMember}${filterByMonth}
     ORDER BY t.created_at DESC
     ;
 `,
      [groupId]
    );
  } catch {
    const error = new Error("dataSource Error");
    error.statusCode = 400;
    throw error;
  }
};

const getGroupMain = async (groupId) => {
  try {
    const [data] = await AppDataSource.query(
      `WITH Finances AS (
        SELECT
            p.type AS t,
            JSON_OBJECT(
              'financeId',uf.id,
                'userId', u.id,
                'userImage', u.profile_image,
                'providerImage', p.image_url,
                'providerName', p.provider_name,
                'financeNumber', uf.finance_number,
                'amount', COALESCE(SUM(t.amount), 0)
            ) AS finances
        FROM user_finances uf
        LEFT JOIN transactions t ON uf.id = t.user_finances_id
        JOIN providers p ON uf.provider_id = p.id
        JOIN users u ON u.id = uf.user_id
        WHERE u.grouping_id = ? AND uf.is_shared = 1
        GROUP BY uf.id, p.type
    ),
    UserNames AS (
        SELECT JSON_OBJECT(
            'userId', u.id,
            'userImage', u.profile_image
        ) AS user_names
        FROM users u
        WHERE u.grouping_id = ?
    ),
    DayCounts as(select DATEDIFF(CURRENT_TIMESTAMP,g.created_at) as dayCounts from groupings g where id = 1
    ),
    Expenses as(
      select json_object("totalAmounts",coalesce(sum(t.amount),0), "totalCounts",count(t.id)) as totals
      from transactions t
      join user_finances uf on uf.id = t.user_finances_id
      join users u on u.id = uf.user_id
      where u.grouping_id = ? and uf.is_shared = 1 and amount < 0
    ),
    Incomes as(
      select json_object("totalAmounts",coalesce(sum(t.amount),0), "totalCounts",count(t.id)) as totals
      from transactions t
      join user_finances uf on uf.id = t.user_finances_id
      join users u on u.id = uf.user_id
      where u.grouping_id = ? and uf.is_shared = 1 and amount > 0
    )
    SELECT
      (select JSON_ARRAYAGG(user_names) FROM UserNames) AS members,
      (select dayCounts from DayCounts) as dayCount,
      (select totals from Incomes) as totalIncomes,
      (select totals from Expenses) as totalExpenses,
      (SELECT JSON_ARRAYAGG(finances) FROM Finances WHERE t = "b") AS banks,
      (SELECT JSON_ARRAYAGG(finances) FROM Finances WHERE t = "c") AS cards;`,
      [groupId, groupId, groupId, groupId]
    );
    return data;
  } catch {
    const error = new Error("dataSource Error");
    error.statusCode = 400;
    throw error;
  }
};
const getMembers = async (groupId) => {
  try {
    const [data] = await AppDataSource.query(
      `select
    JSON_ARRAYAGG(JSON_OBJECT(
      "userId", u.id,
      "userName",u.user_name
    )) as members
  from users u
  where grouping_id = ?;`,
      [groupId]
    );
    return data;
  } catch {
    const error = new Error("dataSource Error");
    error.statusCode = 400;
    throw error;
  }
};
const changeSharingStatus = async (userId, query) => {
  try {
    const { changedRows } = await AppDataSource.query(
      `UPDATE user_finances
      SET is_shared = ${query}
      where user_id = ?;
      `,
      [userId]
    );
    return changedRows;
  } catch {
    const error = new Error("dataSource Error");
    error.statusCode = 400;
    throw error;
  }
};
const getFinanceList = async (userId) => {
  try {
    const [data] = await AppDataSource.query(
      `WITH Finances AS (
        SELECT
            p.type AS t,
            JSON_OBJECT(
              'financeId',uf.id,
                'providerImage', p.image_url,
                'providerName', p.provider_name,
                'financeNumber', uf.finance_number,
                'is_shared', uf.is_shared
            ) AS finances
        FROM user_finances uf
        JOIN providers p ON uf.provider_id = p.id
        JOIN users u ON u.id = uf.user_id
        where u.id = ?
        GROUP BY uf.id, uf.provider_id, p.type
        order by p.provider_name ASC
    )
    SELECT
      (select JSON_ARRAYAGG(finances) from Finances where t = "b") as banks,
      (select JSON_ARRAYAGG(finances) from Finances where t = "c") as cards;`,
      [userId]
    );
    return data;
  } catch {
    const error = new Error("dataSource Error");
    error.statusCode = 400;
    throw error;
  }
};

const getSharedFinances = async (
  groupId,
  filterByMonth,
  filterByMember,
  filterByType
) => {
  try {
    const data = await AppDataSource.query(
      `SELECT
        providerName, providerImage,
        sum(sm) as total,
        JSON_ARRAYAGG(info) AS finances
    FROM (
        SELECT
        p.provider_name AS providerName,
        p.image_url as providerImage,
        COALESCE(SUM(t.amount), 0) as sm,
        JSON_OBJECT(
            "userId", u.id,
            "userProfile", u.profile_image,
            "financeId", uf.id,
            "financeNumber", uf.finance_number,
            "sum", COALESCE(SUM(t.amount), 0)
            ) as info
        FROM user_finances uf
        LEFT JOIN transactions t ON uf.id = t.user_finances_id
        JOIN providers p ON uf.provider_id = p.id
        JOIN users u ON u.id = uf.user_id
        WHERE u.grouping_id = ? AND uf.is_shared = 1 ${filterByType} ${filterByMember} ${filterByMonth}
        GROUP BY uf.provider_id, u.id, p.provider_name, uf.finance_number, uf.id
    ) AS subquery
    GROUP BY providerName,providerImage;`,
      [groupId]
    );
    return { info: data };
  } catch {
    const error = new Error("dataSource Error");
    error.statusCode = 400;
    throw error;
  }
};
module.exports = {
  sendInvitation,
  addMember,
  getGroupById,
  getMemberCount,
  getMemberList,
  getGroupMain,
  getSharedFinances,
  getMembers,
  getFinanceList,
  changeSharingStatus,
  getGroupFinanceManagement,
  withdrawFromGroup,
  withdrawThenRemoveGroup,
  getFinanceDetail,
};
