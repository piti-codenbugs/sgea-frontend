export interface CourseDto {
    id: number;
    code: string;
    name: string;
    semester: string;
    curriculum: string;
    professorId: number | null;
    professorName?: string;
}

export interface CreateCourseRequestDto {
    code: string;
    name: string;
    semester: string;
    curriculum: string;
}

export interface UpdateCourseRequestDto {
    code?: string;
    name?: string;
    semester?: string;
    curriculum?: string;
    professorId?: number | null;
}