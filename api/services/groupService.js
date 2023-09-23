const groupDao = require("../models/groupDao");
const { getUserByPhoneNumber } = require("../models/userDao");
const { validatePhoneNumber } = require("../utils/validate");

const sendInvitation = async (userId, receiverPhoneNumber) => {
  validatePhoneNumber(receiverPhoneNumber);

  const groupId = await groupDao.getGroupById(userId);
  if (groupId) {
    const memberCount = await groupDao.getMemberCount(groupId);
    if (memberCount >= 5) {
      const error = new Error("Exceeds maximum member count: 5");
      error.statusCode = 400;
      throw error;
    }
  }
  const receiverId = await getUserByPhoneNumber(receiverPhoneNumber)?.id;
  if (!receiverId) {
    const error = new Error("User not signed up");
    error.statusCode = 404;
    throw error;
  }

  const receiverGroupId = await groupDao.getGroupById(receiverId);
  if (receiverGroupId === groupId) {
    const error = new Error("The user is already a member");
    error.statusCode = 400;
    throw error;
  }
  if (receiverGroupId) {
    const error = new Error("The user is in other groups");
    error.statusCode = 400;
    throw error;
  }

  await groupDao.sendInvitation(userId, receiverId);
  await groupDao.addMember(userId, receiverId, groupId);
};

const getMemberList = async (userId) => {
  const groupId = await groupDao.getGroupById(userId);
  if (!groupId) {
    const error = new Error("User doesn't have a group");
    error.statusCode = 400;
    throw error;
  }
  return await groupDao.getMemberList(groupId);
};
const getFinanceDetail = async (financeId, yearValue, monthValue = "") => {
  if (!yearValue) {
    return await groupDao.getFinanceDetail(financeId);
  }
  const filteringQuery =
    " AND t.created_at LIKE " + '"' + yearValue + "-" + monthValue + '%"';
  return await groupDao.getFinanceDetail(financeId, filteringQuery);
};

const getGroupMain = async (userId) => {
  const groupId = await groupDao.getGroupById(userId);
  if (!groupId) {
    const error = new Error("User doesn't have a group");
    error.statusCode = 400;
    throw error;
  }
  return await groupDao.getGroupMain(groupId);
};

const getFinanceList = async (userId) => {
  return await groupDao.getFinanceList(userId);
};

const changeSharingStatus = async (userId, isAll, financeIds) => {
  if (isAll) return await groupDao.changeSharingStatus(userId, "1");
  if (!financeIds) return await groupDao.changeSharingStatus(userId, "0");
  return await groupDao.changeSharingStatus(
    userId,
    `(id IN (${financeIds}))`,
    financeIds
  );
};

const getSharedFinances = async (
  userId,
  yearValue,
  monthValue,
  memberId,
  type
) => {
  const groupId = await groupDao.getGroupById(userId);
  if (!groupId) {
    const error = new Error("User doesn't have a group");
    error.statusCode = 400;
    throw error;
  }

  const filterByType = " AND p.type = " + type;
  const filterByMember = memberId ? " AND u.id = " + memberId : "";
  const filterByMonth = yearValue
    ? " AND t.created_at LIKE " + '"' + yearValue + "-" + monthValue + '%"'
    : "";
  const membersObj = await groupDao.getMembers(groupId);
  const dataObj = await groupDao.getSharedFinances(
    groupId,
    filterByMonth,
    filterByMember,
    filterByType
  );
  return { data: { ...membersObj, ...dataObj } };
};
const getGroupFinanceManagement = async (
  userId,
  monthValue = "",
  yearValue,
  memberId
) => {
  const groupId = await groupDao.getGroupById(userId);
  if (!groupId || !yearValue) {
    const error = new Error("key error");
    error.statusCode = 400;
    throw error;
  }
  const filterByMember = memberId ? " AND u.id = " + memberId : "";
  const filterByMonth =
    " AND t.created_at LIKE " + '"' + yearValue + "-" + monthValue + '%"';
  const members = await groupDao.getMembers(groupId);
  const incomes = await groupDao.getGroupFinanceManagement(
    groupId,
    " AND amount > 0",
    filterByMember,
    filterByMonth
  );
  const expenses = await groupDao.getGroupFinanceManagement(
    groupId,
    " AND amount < 0",
    filterByMember,
    filterByMonth
  );
  return {
    ...members,
    income: [...incomes],
    expense: [...expenses],
  };
};

const withdrawFromGroup = async (userId) => {
  const groupId = await groupDao.getGroupById(userId);
  if (!groupId) {
    const error = new Error("User doesn't have a group");
    error.statusCode = 400;
    throw error;
  }
  const memberCount = await groupDao.getMemberCount(groupId);
  if (memberCount > 2) {
    return await groupDao.withdrawFromGroup(userId, groupId);
  }
  return await groupDao.withdrawThenRemoveGroup(groupId);
};
module.exports = {
  sendInvitation,
  getMemberList,
  getSharedFinances,
  getGroupMain,
  getSharedFinances,
  getFinanceList,
  changeSharingStatus,
  getGroupFinanceManagement,
  withdrawFromGroup,
  getFinanceDetail,
};
