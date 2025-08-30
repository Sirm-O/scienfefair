
import { Criterion } from './types';

export interface ProjectCategory {
  name: string;
  description: string;
}

export const PROJECT_CATEGORIES_WITH_DESCRIPTIONS: ProjectCategory[] = [
  { name: 'Mathematical Science', description: 'Encompasses areas like Algebra, Analysis, Applied Mathematics, Geometry, Probability & Statistics, and related topics.' },
  { name: 'Physics', description: 'Covers Astronomy, Atoms, Molecules, Solids, Instrumentation & Electronics, Magnetism & Electromagnetism, Particle Physics, Optics, Lasers, and Theoretical Physics.' },
  { name: 'Computer Science', description: 'Includes Algorithms, Databases, Artificial Intelligence, Networking & Communications, Computational Science, Graphics, Computer Systems, Operating Systems, Programming, and Software Engineering.' },
  { name: 'Chemistry', description: 'Involves Analytical, General, Inorganic, Organic, and Physical Chemistry.' },
  { name: 'Biology and Biotechnology', description: 'Covers Cellular Biology, Molecular Genetics, Immunology, Antibiotics, Antimicrobials, Bacteriology, Virology, Medicine & Health Sciences, and Photosynthesis.' },
  { name: 'Energy and Transportation', description: 'Encompasses Aerospace, Alternative Fuels, Fossil Fuel Energy, Renewable Energy, Space, Air & Marine, Solar, Energy Conservation, and similar sustainability topics.' },
  { name: 'Environmental Science and Management', description: 'Focuses on Bioremediation, Ecosystems Management, Environmental Engineering, Land Resource Management, Recycling, Waste Management, Pollution, Blue Economy, Soil Conservation, and Landscaping.' },
  { name: 'Agriculture', description: 'Covers Agronomy, Plant Science & Systematics, Plant Evolution, Animal Sciences (e.g., Animal Husbandry), and Ecology.' },
  { name: 'Food Technology, Textiles & Home Economics', description: 'Includes Food Product Development, Process Design, Food Engineering, Food Microbiology, Food Packaging & Preservation, Food Safety, Diet, Textile Design, Interior Design, and Decoration.' },
  { name: 'Engineering', description: 'Involves Design, Building, Engine & Machine Use, Structures, Apparatus, Manufacturing Processes, Aeronautical Engineering, Vehicle Development, and New Product Development.' },
  { name: 'Technology and Applied Technology', description: 'Focuses on Appropriate Technology, Innovations in Science & Industry, Knowledge Economy, and Research & Development.' },
  { name: 'Behavioral Science', description: 'Encompasses Psychology, Animal Conservation, Behavior Change, and Disaster & Stress Response Management.' },
  { name: 'Robotics', description: 'Involves the conception, engineering, design, manufacture, and operation of robots, including automation and AI integration.' }
];

export const PROJECT_CATEGORIES = PROJECT_CATEGORIES_WITH_DESCRIPTIONS.map(c => c.name);


export const PART_A_CRITERIA: Criterion[] = [
  { id: 'a1', text: 'Write up neatly and logically organized', description: 'Write with clearly labeled sections eg. Abstract, and plagiarism pledge etc', maxScore: 2, step: 0.5 },
  { id: 'a2', text: 'Evidence of background research in write up (max 1mk)', description: 'Background information and knowledge, summarized in write up with articles in appendix', maxScore: 2, step: 0.5 },
  { id: 'a3', text: 'Introduction in write up (max 1mk)', description: 'Including focus question / problem statement and supporting evidence', maxScore: 2, step: 0.5 },
  { id: 'a4', text: 'Written language in write up and on poster', description: 'Legible, correct fonts, scientific, suitable headings, no spelling mistakes', maxScore: 2, step: 0.5 },
  { id: 'a5', text: 'Aim / hypothesis/ objectives of project reflected in write up and on poster', maxScore: 2, step: 0.5 },
  { id: 'a6', text: 'Methods (and materials) used or technologies used in write up and on poster', description: 'Presented in logical order, correct expression, more extensive in report than on poster', maxScore: 2, step: 0.5 },
  { id: 'a7', text: 'Variables identified in write up and on poster', description: 'Dependent and independent variable', maxScore: 2, step: 0.5 },
  { id: 'a8', text: 'Results in write up and on posters', description: 'Full observations, presented in a tabular form and in graphs in write up. Summary in graph or diagram form on poster. The results should be scientifically and mathematically suitable and correct.', maxScore: 2, step: 0.5 },
  { id: 'a9', text: 'Analysis of results in write up and on poster', description: 'Report/findings/graphs explained in words, more extensive in write up than on poster', maxScore: 2, step: 0.5 },
  { id: 'a10', text: 'Discussion of results in write up and on poster', description: 'Pattern and trends are noted and explained, anomalies/unusual results are discussed, limitations noted and clarified', maxScore: 2, step: 0.5 },
  { id: 'a11', text: 'Future possibilities of research in write up / recommendations', description: 'Future extensions and possibilities are identified', maxScore: 2, step: 0.5 },
  { id: 'a12', text: 'Conclusions are reflected in write up and on posters', description: 'They are valid, based on findings and linked to objectives.', maxScore: 2, step: 0.5 },
  { id: 'a13', text: 'Reference in write up', description: 'Reference of books, magazines and internet addresses given in the correct format', maxScore: 2, step: 0.5 },
  { id: 'a14', text: 'Acknowledgements in write up and on poster', description: 'It is important to find out depth of audit assistance received and how this assistance has been used', maxScore: 2, step: 0.5 },
  { id: 'a15', text: 'Display board – summaries project and is neatly organized', description: 'This must include correct size of the board and logical flow of presentation', maxScore: 2, step: 0.5 },
];

export const PART_B_CRITERIA: Criterion[] = [
  { id: 'b1', text: 'Capture of interest', description: 'The learners presentation is exciting and stimulating', maxScore: 1, step: 0.5 },
  { id: 'b2', text: 'Enthusiasm / effort', description: 'A worthwhile effort was made to explain, lots of enthusiasm', maxScore: 1, step: 0.5 },
  { id: 'b3', text: 'Voice / tone', description: 'Totally audible, varying intonation', maxScore: 1, step: 0.5 },
  { id: 'b4', text: 'Self-confidence', description: 'Ease of presentation', maxScore: 1, step: 0.5 },
  { id: 'b5', text: 'Scientific Language', description: 'Use of appropriate language and vocabulary', maxScore: 1, step: 0.5 },
  { id: 'b6', text: 'Response to questions', description: 'Carefully listens to questions, responds clearly and intelligently', maxScore: 2, step: 0.5 },
  { id: 'b7', text: 'Presentation of project', description: 'Can present the project in a logical, well organized way (without reciting/ reading directly)', maxScore: 2, step: 0.5 },
  { id: 'b8', text: 'Limitations / weaknesses and gaps', description: 'The learner is fully aware of limitations and can explain reasons for gaps', maxScore: 2, step: 0.5 },
  { id: 'b9', text: 'Possible suggestions or expanding project / recommendation', description: 'The learner is fully aware of possibilities for expanding the project', maxScore: 2, step: 0.5 },
  { id: 'b10', text: 'Authenticity', description: 'The learner takes complete ownership of the project and integrates assistance received in their answers to questions. Can demonstrate all of the methods / techniques used.', maxScore: 2, step: 0.5 },
];

export const PART_C_CRITERIA: Criterion[] = [
  { id: 'c1', text: 'Statement of the problem', description: 'Clear statement of the problem and objectives', maxScore: 2, step: 0.5 },
  { id: 'c2', text: 'Introduction / Background information', description: 'Relationship between the project and other research done in the same area', maxScore: 2, step: 0.5 },
  { id: 'c3', text: 'Application of scientific concepts to every day life', maxScore: 3, step: 1 },
  { id: 'c4', text: 'Subject mastery', description: 'Demonstration of deeply and accurate knowledge of scientific and engineering principles involved', maxScore: 3, step: 1 },
  { id: 'c5', text: 'Literature review', description: 'Project shows understanding of existing knowledge. (citations).', maxScore: 2, step: 0.5 },
  { id: 'c6', text: 'Data', description: 'Adequate data obtained to verify conclusions.', maxScore: 3, step: 1 },
  { id: 'c7', text: 'Variables', description: 'Variables/ parameters were clearly defined and recognized, controls used', maxScore: 2, step: 0.5 },
  { id: 'c8', text: 'Statement of originality', description: 'What inspired the person to come up with the project', maxScore: 2, step: 0.5 },
  { id: 'c9a', text: 'Logical Sequence: Apparatus / requirements', maxScore: 2, step: 0.5 },
  { id: 'c9b', text: 'Logical Sequence: Procedure / Method', maxScore: 2, step: 0.5 },
  { id: 'c9c', text: 'Logical Sequence: Correct illustrations', maxScore: 3, step: 1 },
  { id: 'c10', text: 'Linkage to emerging issues', description: 'Linking of the innovation with emerging issues or adds value to existing body of knowledge', maxScore: 2, step: 0.5 },
  { id: 'c11', text: 'Originality', description: 'Is the problem original or does the approach to the problem show originality, Does the construction or design of equipment / project show originality', maxScore: 3, step: 1 },
  { id: 'c12', text: 'Creativity', description: 'Have materials / equipment been used in an ingenious way, To what extent does the project / exhibit represent the student\'s own effort/skill', maxScore: 2, step: 0.5 },
  { id: 'c13', text: 'Skill: Was the workmanship of the display skillful?', description: 'Workmanship is neat, well done. Project requires minimum maintenance', maxScore: 2, step: 0.5 },
];
