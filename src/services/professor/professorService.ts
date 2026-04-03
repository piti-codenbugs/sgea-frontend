import api from '@/services/api'
import type { CourseDto } from '@/dtos/course.dto'

export const professorService = {
    async getMyCourses(): Promise<CourseDto[]> {
        const response = await api.get<CourseDto[]>('/course-assignment/my-courses');
        return response.data;
    }
}