export interface ToolStudent {
    id: string;
    admissionId: string;
    name: string;
    email: string;
    mobile: string;
    batchName: string;
    batchId: string;
    course: string;
    status: string;
    stage: string;
    domainName: string;
    hubName: string;
    advisorName: string;
    paymentMethod: string;
    createdOn: string;
    profileImage?: string;
    totalCount?: string;
}

export interface ToolStudentListResponse {
    data: ToolStudent[];
    totalCount: string;
}

export interface FilterOption {
    id: string;
    name: string;
}

export interface Batch extends FilterOption { }
export interface Course extends FilterOption { }
export interface Domain extends FilterOption { }

export interface Employee {
    id: string;
    name: string;
    role: string;
}

export interface StatusOption {
    id: string;
    code: number;
    meaning: string;
}

export interface ToolStudentParams {
    page?: number;
    pageSize?: number;
    searchKey?: string;
    batchId?: string;
    courseId?: string;
    domainId?: string;
    hubId?: string;
    statusCodes?: string;
    // Add other filter keys as needed
}
