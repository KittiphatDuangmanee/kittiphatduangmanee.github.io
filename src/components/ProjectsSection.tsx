import { useState } from 'react'

import { projects } from '../data/projects.ts'
import { site } from '../data/site.ts'
import type { ProjectId } from '../data/types.ts'
import { ProjectDetailModal } from './ProjectDetailModal.tsx'
import { ProjectShowcaseCard } from './ProjectShowcaseCard.tsx'
import { Container } from './primitives/Container.tsx'
import { SectionHeading } from './primitives/SectionHeading.tsx'

const copy = site.projects

/**
 * Projects: the two finished systems, each shown through its real screens
 * with a short summary beside them. The detail modal is owned here, so only
 * one can be open and each carousel knows to hold while it is.
 */
export function ProjectsSection() {
  const [openId, setOpenId] = useState<ProjectId | null>(null)
  const openProject = projects.find((project) => project.id === openId) ?? null

  return (
    <section id={copy.id} aria-labelledby="projects-heading" className="border-t border-hairline">
      <Container className="py-20 lg:py-28">
        <SectionHeading headingId="projects-heading" heading={copy.heading} lede={copy.lede} />

        <div className="mt-14 grid gap-20 lg:mt-20 lg:gap-28">
          {projects.map((project) => (
            <ProjectShowcaseCard
              key={project.id}
              project={project}
              detailsOpen={openId === project.id}
              onOpenDetails={() => setOpenId(project.id)}
            />
          ))}
        </div>
      </Container>

      <ProjectDetailModal project={openProject} onClose={() => setOpenId(null)} />
    </section>
  )
}
