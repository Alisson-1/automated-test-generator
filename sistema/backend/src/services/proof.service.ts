import PDFDocument from 'pdfkit';
import { ExamRepository } from '../repositories/exam.repository';
import { QuestionRepository } from '../repositories/question.repository';
import { GenerateProofsDTO, GenerateProofsResult, ProofHeader } from '../types/proof.types';
import { Exam } from '../types/exam.types';
import { Question } from '../types/question.types';
import { NotFoundError, ValidationError } from '../utils/errors';

type PDFDoc = InstanceType<typeof PDFDocument>;

interface ShuffledAlternative {
  description: string;
  correct: boolean;
}

interface ShuffledQuestion {
  statement: string;
  alternatives: ShuffledAlternative[];
  answerKey: string;
}

interface ProofData {
  number: number;
  questions: ShuffledQuestion[];
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function computeAnswerKey(
  alternatives: ShuffledAlternative[],
  mode: 'letters' | 'powers-of-2',
): string {
  if (mode === 'letters') {
    const correctLetters = alternatives
      .map((alt, i) => (alt.correct ? String.fromCharCode(65 + i) : null))
      .filter(Boolean) as string[];
    return correctLetters.join('/');
  }
  let sum = 0;
  alternatives.forEach((alt, i) => {
    if (alt.correct) sum += Math.pow(2, i);
  });
  return sum.toString();
}

function buildProofs(exam: Exam, questions: Question[], count: number): ProofData[] {
  return Array.from({ length: count }, (_, i) => {
    const shuffledQuestions = shuffle(questions);
    const proofQuestions: ShuffledQuestion[] = shuffledQuestions.map((q) => {
      const shuffledAlts = shuffle(q.alternatives) as ShuffledAlternative[];
      return {
        statement: q.statement,
        alternatives: shuffledAlts,
        answerKey: computeAnswerKey(shuffledAlts, exam.identifierMode),
      };
    });
    return { number: i + 1, questions: proofQuestions };
  });
}

function writeFooter(doc: PDFDoc, proofNumber: number): void {
  const { left, right, bottom } = doc.page.margins;
  const footerY = doc.page.height - bottom - 16;
  const contentWidth = doc.page.width - left - right;
  doc
    .fontSize(9)
    .fillColor('#666666')
    .text(`— Proof #${proofNumber} —`, left, footerY, {
      width: contentWidth,
      align: 'center',
      lineBreak: false,
    });
}

function writeHeader(doc: PDFDoc, exam: Exam, header: ProofHeader): void {
  const { left, right } = doc.page.margins;
  const contentWidth = doc.page.width - left - right;
  const startX = left;
  const startY = doc.y;

  const hasLogo = !!header.logoBase64;
  const logoColW = hasLogo ? 85 : 0;
  const rightX = startX + logoColW;
  const rightW = contentWidth - logoColW;

  const row1H = 26;
  const row2H = 20;
  const row3H = 20;
  const row4H = 32;
  const upperH = row1H + row2H + row3H;

  doc.strokeColor('#000000').lineWidth(0.5);

  if (hasLogo) {
    doc.rect(startX, startY, logoColW, upperH).stroke();
    try {
      const imgBuf = Buffer.from(header.logoBase64!, 'base64');
      doc.image(imgBuf, startX + 3, startY + 3, { fit: [logoColW - 6, upperH - 6] });
    } catch { }
  }

  doc.rect(rightX, startY, rightW, row1H).stroke();
  const row1Text = (header.institution || exam.title).toUpperCase();
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000')
    .text(row1Text, rightX + 4, startY + (row1H - 11) / 2, {
      width: rightW - 8, align: 'center', lineBreak: false,
    });

  const row2Y = startY + row1H;
  doc.rect(rightX, row2Y, rightW, row2H).stroke();
  doc.fontSize(9).font('Helvetica').fillColor('#000000')
    .text(`DISCIPLINE: ${header.discipline}`, rightX + 4, row2Y + (row2H - 9) / 2, {
      width: rightW - 8, lineBreak: false,
    });

  const row3Y = row2Y + row2H;
  const profW = Math.round(rightW * 0.58);
  const dateW = rightW - profW;
  doc.rect(rightX, row3Y, profW, row3H).stroke();
  doc.rect(rightX + profW, row3Y, dateW, row3H).stroke();
  doc.fontSize(9).font('Helvetica').fillColor('#000000')
    .text(`PROF.: ${header.teacher}`, rightX + 4, row3Y + (row3H - 9) / 2, {
      width: profW - 8, lineBreak: false,
    });
  const dateParts = header.date ? header.date.split('-') : [];
  const dateStr =
    dateParts.length === 3
      ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`
      : (header.date || '___/___/___');
  doc.fontSize(9).font('Helvetica').fillColor('#000000')
    .text(`DATE: ${dateStr}`, rightX + profW + 4, row3Y + (row3H - 9) / 2, {
      width: dateW - 8, lineBreak: false,
    });

  const row4Y = startY + upperH;
  const gradeW = Math.round(contentWidth * 0.38);
  const valorW = contentWidth - gradeW;
  doc.rect(startX, row4Y, gradeW, row4H).stroke();
  doc.rect(startX + gradeW, row4Y, valorW, row4H).stroke();
  doc.fontSize(9).font('Helvetica').fillColor('#000000')
    .text('GRADE: _______________________', startX + 4, row4Y + (row4H - 9) / 2, {
      width: gradeW - 8, lineBreak: false,
    });
  const examValueLabel = header.examValue ? `EXAM VALUE: ${header.examValue}` : 'EXAM VALUE:';
  doc.fontSize(9).font('Helvetica').fillColor('#000000')
    .text(examValueLabel, startX + gradeW + 4, row4Y + (row4H - 9) / 2, {
      width: valorW - 8, lineBreak: false,
    });

  doc.y = row4Y + row4H + 12;
  doc.x = left;

  if (header.institution) {
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#000000')
      .text(exam.title, { align: 'center', width: contentWidth });
    doc.moveDown(0.4);
  }
}

function writeProof(doc: PDFDoc, proof: ProofData, exam: Exam, header: ProofHeader): void {
  const { left, right } = doc.page.margins;
  const contentWidth = doc.page.width - left - right;

  writeHeader(doc, exam, header);

  doc
    .moveTo(left, doc.y)
    .lineTo(doc.page.width - right, doc.y)
    .strokeColor('#cccccc')
    .lineWidth(0.5)
    .stroke();
  doc.moveDown(0.8);

  const altLabel =
    exam.identifierMode === 'letters'
      ? (n: number) => String.fromCharCode(65 + n)
      : (n: number) => Math.pow(2, n).toString();

  proof.questions.forEach((question, qIndex) => {
    doc
      .fontSize(11)
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .text(`${qIndex + 1}. `, { continued: true })
      .font('Helvetica')
      .text(question.statement, { width: contentWidth });

    doc.moveDown(0.4);

    question.alternatives.forEach((alt, altIndex) => {
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`   ${altLabel(altIndex)}) ${alt.description}`, { width: contentWidth });
    });

    doc.moveDown(0.5);

    const answerLabel = exam.identifierMode === 'letters' ? 'Answer' : 'Sum';
    doc.fontSize(10).text(`   ${answerLabel}: _________________________`, { width: contentWidth });

    doc.moveDown(1.2);
  });

  doc
    .moveTo(left, doc.y)
    .lineTo(doc.page.width - right, doc.y)
    .strokeColor('#cccccc')
    .lineWidth(0.5)
    .stroke();
  doc.moveDown(0.8);

  doc.fontSize(11).font('Helvetica').fillColor('#000000').text('Name: _____________________________________________', { width: contentWidth });
  doc.moveDown(0.8);
  doc.text('CPF: ______________________________', { width: contentWidth });
}

function buildCSV(proofs: ProofData[], questionCount: number): string {
  const headers = ['proof_number', ...Array.from({ length: questionCount }, (_, i) => `q${i + 1}`)];
  const rows = proofs.map((proof) => [proof.number.toString(), ...proof.questions.map((q) => q.answerKey)].join(','));
  return [headers.join(','), ...rows].join('\n');
}

async function buildPDF(proofs: ProofData[], exam: Exam, header: ProofHeader): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 60, autoFirstPage: false });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    let currentProofNumber = 0;

    doc.on('pageAdded', () => {
      if (currentProofNumber === 0) return;
      writeFooter(doc, currentProofNumber);
      doc.y = doc.page.margins.top;
      doc.x = doc.page.margins.left;
      doc.fillColor('#000000').fontSize(11);
    });

    for (const proof of proofs) {
      currentProofNumber = proof.number;
      doc.addPage();
      writeProof(doc, proof, exam, header);
    }

    doc.end();
  });
}

export class ProofService {
  constructor(
    private examRepository: ExamRepository,
    private questionRepository: QuestionRepository,
  ) {}

  async generate(examId: string, dto: GenerateProofsDTO): Promise<GenerateProofsResult> {
    const exam = this.examRepository.findById(examId);
    if (!exam) throw new NotFoundError('Exam not found');

    if (dto.count < 1 || dto.count > 500) {
      throw new ValidationError('Proof count must be between 1 and 500');
    }

    const questions = exam.questionIds.map((qId) => {
      const q = this.questionRepository.findById(qId);
      if (!q) throw new NotFoundError(`Question "${qId}" not found`);
      return q;
    });

    const proofs = buildProofs(exam, questions, dto.count);
    const [pdfBuffer, csv] = await Promise.all([
      buildPDF(proofs, exam, dto.header),
      Promise.resolve(buildCSV(proofs, exam.questionIds.length)),
    ]);

    return { pdf: pdfBuffer.toString('base64'), csv };
  }
}
