import React, { createContext, useContext, useState } from 'react';

type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  status: 'active' | 'completed';
  tags: string[];
  technologies: string[];
  techStack: string[];
  languages: string[];
  groupMembers: string[];
  duration: string;
  type: string;
  category: string;
  documentUrl?: string;
  documentName?: string;
};

type ProjectContextType = {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);

  const addProject = (project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setProjects(prev => [newProject, ...prev]);
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
} 