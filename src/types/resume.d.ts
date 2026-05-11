type HeadingData = {
    name: string;
    title: string;
    email?: string | undefined;
    website?: string | undefined;
    location?: string | undefined;
    summary?: string | undefined;
    social?: {
        github: string;
        linkedin: string;
    } | undefined;
}

type ExperienceData = {
    company: string;
    role: string;
    start: string;
    description: string;
    highlights: string[];
    end?: string | undefined;
    location?: string | undefined;
    annotations?: {
        term: string;
        detail: string;
        style?: "keyword" | "tech" | "achievement" | undefined;
    }[] | undefined;
}


type EducationData = {
    institution: string;
    location: string;
    degree: string;
    start: string;
    end?: string | undefined;
    gpa?: string | undefined;
    activities?: string | undefined;
    awards?: string | undefined;
    annotations?: {
        term: string;
        detail: string;
        style?: "keyword" | "tech" | "achievement" | undefined;
    }[] | undefined;
}

type ProjectData = {
    id: string;
    body?: string;
    collection: "projects";
    data: ProjectSpecification;
    rendered?: RenderedContent;
    filePath?: string;
}

type ProjectSpecification = {
    name: string,
    description: string,
    tags: string[],
    featured: boolean;
    relatedPosts: string[],
    repoUrl?: string | undefined,
    liveUrl?: string | undefined,
    start?: string | undefined,
    end?: string | undefined,
    resumeDisplayDate?: boolean | undefined,
    resumeDisplayPriority?: number | undefined,
    resumeSummary?: string | undefined,
    resumeHighlights?: string[] | undefined,
    relatedSeries?: string | undefined,
    image?: string | undefined,
    imageCaption?: string | undefined,
    homepagePin?: boolean | undefined,
    annotations?: {
        term: string,
        detail: string,
        style?: "keyword" | "tech" | "achievement" | undefined,
    }[] | undefined,
}

type SkillsData = {
    name: string,
    items: string[]
}