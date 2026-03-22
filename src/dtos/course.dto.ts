export interface CourseDto {
    code: number;
    name: string;
    careerId: number;
    careerName: string;
    semester: string;
    curriculum: string;
    professorId: number | null;
    professorName: string | null;
}

export interface CreateCourseRequestDto {
    code: number;
    name: string;
    careerId: number;
}

export interface UpdateCourseRequestDto {
    code?: number;
    name?: string;
    careerId?: number;
    professorId?: number | null;
}