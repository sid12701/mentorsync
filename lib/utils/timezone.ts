import { format, parse, addMinutes, startOfDay, endOfDay, isAfter, isBefore} from 'date-fns';
import {fromZonedTime, toZonedTime} from 'date-fns-tz';

export function localTimeToUTC(date:string, time:string, timezone:string): Date{
    const dateTime = `${date}${time}`
    const dateTimeString = `${date}T${time}:00`
    const utcDate = fromZonedTime(dateTimeString, timezone)
    return utcDate
}


export function utcToLocalTime (utcDate: Date, timezone: string ): Date{
    return toZonedTime(utcDate, timezone)
}


export function formatInTimezone(utcDate: Date, timezone: string, formatStr: string= "PPpp"){
    const zoneDate = toZonedTime(utcDate, timezone)
    return format(zoneDate, formatStr)
}

export function getDayOfWeekInTimezone(date: Date, timezone:string): number {
    const zonedDate = toZonedTime( date, timezone )
    return zonedDate.getDay();
}

export function generateTimeSlots(startTime: Date, endTime: Date, durationMinutes: number): Array<{start:Date; end:  Date}>{
    const slots: Array<{start:Date; end:Date}> = [];
    const startMs = startTime.getTime();
    const endMs = endTime.getTime();
    const durationMs = durationMinutes * 60 * 1000;
    let currentStartMs = startMs  
    while (currentStartMs < endMs){
        const currentEndMs = currentStartMs + durationMs

        if(currentEndMs <= endMs){
            slots.push({
                start: new Date(currentStartMs),
                end: new Date(currentEndMs)
            })
        }
        currentStartMs = currentEndMs;
    }

    return slots;

}


export function timeRangesOverlap(start1: Date, end1: Date, start2: Date, end2:Date): boolean { 
    const s1 = start1.getTime()
    const e1 = end1.getTime()
    const s2 = start2.getTime()
    const e2 = end2.getTime()
  
    return s1 < e2 && s2 < e1
}

export function getDayBoundariesInUTC(date: string, timezone: string): {start: Date; end: Date}{
    const localDate = parse(date, 'yyyy-MM-dd', new Date())
    const startOfDayStr = `${date}T00:00:00`
    const endOfDayStr = `${date}T23:59:59.999`
  
    const startUTC = fromZonedTime(startOfDayStr, timezone)
    const endUTC = fromZonedTime(endOfDayStr, timezone)
    return {start: startUTC , end: endUTC}
}


export function parseTimeString(timeStr: string): string {
    const parts = timeStr.split(':')
    return `${parts[0]}:${parts[1]}`
}



export function getCurrentDateInTimezone(timezone: string): string { 
    const now = new Date()
    const zonedNow = toZonedTime(now, timezone)
    return format(zonedNow, 'yyyy-MM-dd')
}

