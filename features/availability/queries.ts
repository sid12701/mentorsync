import {createClient} from '@/lib/supabase/server';
import { AvailabilityPattern } from './types';

export async function getPatternsByTutor(tutorId: string): Promise<AvailabilityPattern[]>{
    const supabase = await createClient();

    const {data, error} = await supabase.from('availability_patterns').select('*').eq('tutor_id',tutorId).eq('is_active', true).order('day_of_week',{ascending:true}).order('start_time',{ascending: true})

    if(error){
        console.error("Error fetching availablity patterns: ", error)
        return []
    }

    return data||[]
}


export async function getPatternById(patternId:string): Promise<AvailabilityPattern | null>{
    const supabase = await createClient();
    const {data,error} = await supabase.from('availability_patterns').select('*').eq('id', patternId).single()

    if (error) {
        console.error('Error fetching pattern:', error)
        return null
      }
    
      return data
}

export async function getPatternsByDay(tutorId: string): Promise<Record<number, AvailabilityPattern[]>>{
    const patterns = await getPatternsByTutor(tutorId);

    const grouped: Record< number, AvailabilityPattern[]> = {
        0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    }

    for(const pattern of patterns){
        grouped[pattern.day_of_week].push(pattern)
    }

    return grouped
}

