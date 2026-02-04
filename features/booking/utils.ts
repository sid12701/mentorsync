import {v4 as uuidv4} from 'uuid';


export function generateMeetingUrl (): string {
    const meetingId = `mentorsync-${uuidv4()}`
    return `https://meet.jit.si/${meetingId}`
}


export function calculateDurationHours(startTime: string, endTime:string): number {
    const start  = new Date(startTime)
    const end = new Date(endTime)

    const diffMs = end.getTime() - start.getTime()
    const diffHours = diffMs / (1000*60*60)
    return diffHours
}


