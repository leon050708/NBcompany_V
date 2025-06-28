import request from '@/utils/request'

/**
 * 获取会议列表（分页）
 * @param {object} params - 查询参数
 */
export function getMeetingList(params) {
    return request({
        url: '/v1/meetings',
        method: 'get',
        params
    })
}

/**
 * 获取单个会议详情
 * @param {number} meetingId - 会议ID
 */
export function getMeetingDetail(meetingId) {
    return request({
        url: `/v1/meetings/${meetingId}`,
        method: 'get'
    })
}

/**
 * 创建新会议
 * @param {object} data - 会议数据
 */
export function createMeeting(data) {
    return request({
        url: '/v1/meetings',
        method: 'post',
        data
    })
}

/**
 * 更新会议信息
 * @param {number} meetingId - 会议ID
 * @param {object} data - 会议更新数据
 */
export function updateMeeting(meetingId, data) {
    return request({
        url: `/v1/meetings/${meetingId}`,
        method: 'put',
        data
    })
}

/**
 * 删除会议
 * @param {number} meetingId - 会议ID
 */
export function deleteMeeting(meetingId) {
    return request({
        url: `/v1/meetings/${meetingId}`,
        method: 'delete'
    })
}

/**
 * (管理员)更新会议审核状态
 * @param {number} meetingId - 会议ID
 * @param {object} data - 包含状态的对象, e.g., { status: 1 }
 */
export function updateMeetingStatus(meetingId, data) {
    return request({
        url: `/v1/meetings/${meetingId}/status`,
        method: 'put',
        data
    })
}
// 在文件末尾添加
/**
 * 重新提交被驳回的会议
 * @param {number} meetingId - 会议ID
 */
export function resubmitMeeting(meetingId) {
    return request({
        url: `/v1/meetings/${meetingId}/resubmit`,
        method: 'post',
    });
}