import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '../generated/prisma/client.js';
import { Nota, Perfil } from '../generated/prisma/enums.js';

const DEMO_DOMAIN = '@demo.memora.local';
const DEMO_PASSWORD = 'Demo@1234';
const BCRYPT_COST = 10;
const TIMEZONE = 'America/Sao_Paulo';
const DAY_MS = 24 * 60 * 60 * 1000;

type DemoDeck = {
  name: string;
  description: string | null;
  cards: ReadonlyArray<readonly [string, string]>;
};

type DemoUser = {
  name: string;
  email: string;
  decks: ReadonlyArray<DemoDeck>;
};

type CardPlan = {
  email: string;
  deckName: string;
  front: string;
  back: string;
  repetitions: number;
  intervalDays: number;
  nextReview: Date;
  lastReview: Date | null;
  reviews: Array<{
    note: Nota;
    previousIntervalDays: number;
    newIntervalDays: number;
    reviewedAt: Date;
  }>;
};

const usuariosDemo: ReadonlyArray<DemoUser> = [
  {
    name: 'Ana Souza',
    email: 'ana.souza@demo.memora.local',
    decks: [
      {
        name: 'Estruturas de Dados',
        description: 'Estruturas fundamentais, suas operações e custos.',
        cards: [
          [
            'O que caracteriza uma pilha?',
            'Uma coleção LIFO: o último elemento inserido é o primeiro a sair.',
          ],
          [
            'O que caracteriza uma fila?',
            'Uma coleção FIFO: o primeiro elemento inserido é o primeiro a sair.',
          ],
          [
            'Qual a principal diferença entre lista ligada e vetor?',
            'A lista liga nós por referências; o vetor armazena elementos em posições contíguas.',
          ],
          [
            'Qual o custo de acessar um índice de um vetor?',
            'O(1), pois o endereço pode ser calculado diretamente.',
          ],
          [
            'Qual o custo de buscar um valor em uma lista ligada simples?',
            'O(n) no pior caso, pois pode ser necessário percorrer todos os nós.',
          ],
          [
            'O que é uma árvore binária?',
            'Uma árvore em que cada nó tem no máximo dois filhos.',
          ],
          [
            'Qual propriedade define uma árvore binária de busca?',
            'Valores menores ficam à esquerda e maiores à direita, conforme a regra de ordenação adotada.',
          ],
          [
            'Qual estrutura permite obter rapidamente o maior ou menor elemento?',
            'Uma heap, com acesso à raiz em O(1) e remoção em O(log n).',
          ],
          [
            'Como uma tabela hash encontra um valor?',
            'Aplica uma função hash à chave para localizar um índice ou compartimento.',
          ],
          [
            'O que é colisão em uma tabela hash?',
            'Quando chaves distintas são mapeadas para o mesmo compartimento.',
          ],
          [
            'O que é um grafo direcionado?',
            'Um grafo cujas arestas têm orientação, representada por pares ordenados de vértices.',
          ],
          [
            'Qual a complexidade de BFS com listas de adjacência?',
            'O(V + E), visitando vértices e arestas.',
          ],
        ],
      },
      {
        name: 'Banco de Dados e SQL',
        description:
          'Modelagem relacional, consultas e propriedades de transações.',
        cards: [
          [
            'O que identifica unicamente uma linha em uma tabela?',
            'Uma chave primária (PRIMARY KEY).',
          ],
          [
            'Para que serve uma chave estrangeira?',
            'Para referenciar uma chave de outra tabela e manter integridade referencial.',
          ],
          [
            'O que garante uma restrição UNIQUE?',
            'Que os valores da coluna ou combinação de colunas não se repitam.',
          ],
          [
            'Para que serve um índice em um banco relacional?',
            'Acelerar consultas em determinadas colunas, com custo adicional de espaço e escrita.',
          ],
          [
            'O que faz SELECT?',
            'Define as colunas ou expressões que serão retornadas pela consulta.',
          ],
          ['Qual a função de WHERE?', 'Filtrar linhas antes do agrupamento.'],
          [
            'O que retorna um INNER JOIN?',
            'Somente linhas com correspondência nas duas relações unidas.',
          ],
          [
            'O que retorna um LEFT JOIN?',
            'Todas as linhas da tabela à esquerda e correspondências da direita; sem correspondência, valores nulos.',
          ],
          [
            'Para que serve GROUP BY?',
            'Agrupar linhas por valores comuns para calcular agregações por grupo.',
          ],
          [
            'Quando usar HAVING em vez de WHERE?',
            'Para filtrar grupos após o GROUP BY, frequentemente usando agregações.',
          ],
          [
            'Quais são as propriedades ACID?',
            'Atomicidade, Consistência, Isolamento e Durabilidade.',
          ],
          [
            'Qual o objetivo da normalização relacional?',
            'Reduzir redundâncias e anomalias por meio de relações bem estruturadas.',
          ],
        ],
      },
      {
        name: 'Redes de Computadores',
        description: 'Protocolos, endereçamento e serviços de rede.',
        cards: [
          [
            'O que identifica um endereço IP?',
            'Uma interface em uma rede IP, dentro do escopo de endereçamento correspondente.',
          ],
          [
            'O que indica o prefixo /24 em IPv4?',
            'Que 24 bits identificam a rede e os 8 restantes identificam hosts nessa sub-rede.',
          ],
          [
            'Qual é a função principal do TCP?',
            'Oferecer transporte confiável, ordenado e orientado a conexão entre aplicações.',
          ],
          [
            'Qual é a característica central do UDP?',
            'Transporte sem conexão, sem garantia de entrega ou ordenação pelo protocolo.',
          ],
          [
            'Para que serve o DNS?',
            'Traduzir nomes de domínio em registros como endereços IP.',
          ],
          [
            'O que é HTTP?',
            'Um protocolo de aplicação para transferência de recursos na Web.',
          ],
          [
            'O que acrescenta HTTPS ao HTTP?',
            'Proteção do tráfego HTTP com TLS, incluindo confidencialidade e autenticação do servidor.',
          ],
          [
            'O que o TLS protege?',
            'A comunicação em trânsito, oferecendo criptografia e integridade, além de autenticação conforme a configuração.',
          ],
          [
            'Para que serve o DHCP?',
            'Configurar dinamicamente parâmetros de rede de hosts, como endereço IP e gateway.',
          ],
          [
            'O que faz um roteador IP?',
            'Encaminha pacotes entre redes com base em informações de roteamento.',
          ],
          [
            'O que identifica uma porta TCP ou UDP?',
            'Um ponto de comunicação de transporte associado a um processo ou serviço no host.',
          ],
          [
            'O que identifica um endereço MAC?',
            'Uma interface na camada de enlace dentro do domínio de rede correspondente.',
          ],
        ],
      },
      {
        name: 'Git e Versionamento',
        description:
          'Conceitos e comandos essenciais para colaboração com Git.',
        cards: [
          [
            'O que é um repositório Git?',
            'Um banco de dados de objetos e referências que registra o histórico versionado do projeto.',
          ],
          [
            'O que representa um commit?',
            'Um snapshot do projeto, metadados e referências aos commits ancestrais.',
          ],
          [
            'O que é uma branch no Git?',
            'Uma referência móvel que aponta para um commit.',
          ],
          [
            'O que faz git merge?',
            'Integra o histórico de outra referência, podendo criar um commit de merge.',
          ],
          [
            'O que faz git rebase?',
            'Reaplica commits sobre uma nova base, criando novos identificadores para os commits reaplicados.',
          ],
          [
            'O que é um conflito de merge?',
            'Uma situação em que o Git não consegue combinar automaticamente alterações concorrentes.',
          ],
          [
            'O que é a área de staging?',
            'A área que prepara o conteúdo que será incluído no próximo commit.',
          ],
          [
            'Para que serve git stash?',
            'Guardar temporariamente alterações locais para limpar a árvore de trabalho.',
          ],
          [
            'O que é uma tag Git?',
            'Uma referência nomeada, geralmente usada para marcar uma versão ou ponto importante.',
          ],
          [
            'O que é um remote?',
            'Uma referência local a um repositório hospedado em outro local.',
          ],
          [
            'Qual a diferença entre git fetch e git pull?',
            'fetch atualiza referências remotas; pull também integra as alterações na branch atual.',
          ],
          [
            'O que HEAD representa?',
            'A referência ao commit ou branch atualmente selecionado no repositório.',
          ],
        ],
      },
      {
        name: 'Inglês Técnico',
        description:
          'Vocabulário frequente em documentação e equipes de software.',
        cards: [
          [
            'O que significa “bug” em desenvolvimento?',
            'Um defeito ou comportamento incorreto no software.',
          ],
          [
            'O que significa “deployment”?',
            'A disponibilização de uma versão de software em um ambiente de execução.',
          ],
          [
            'O que significa “backward compatibility”?',
            'Capacidade de uma versão nova continuar funcionando com clientes ou dados de versões anteriores.',
          ],
          [
            'O que significa “throughput”?',
            'Quantidade de trabalho concluída por unidade de tempo.',
          ],
          [
            'O que significa “latency”?',
            'Tempo decorrido entre uma solicitação ou evento e sua resposta.',
          ],
          [
            'O que significa “idempotent”?',
            'Que repetir a mesma operação produz o mesmo efeito final que executá-la uma vez.',
          ],
          [
            'O que significa “code review”?',
            'Revisão de alterações de código por outras pessoas antes ou durante a integração.',
          ],
          [
            'O que significa “edge case”?',
            'Um caso de entrada ou estado extremo que pode revelar falhas não cobertas pelo fluxo comum.',
          ],
          [
            'O que significa “dependency”?',
            'Uma biblioteca, serviço ou componente de que outro software depende.',
          ],
          [
            'O que significa “runtime”?',
            'O período ou ambiente em que um programa está sendo executado.',
          ],
          [
            'O que significa “stack trace”?',
            'Uma sequência de chamadas que ajuda a localizar a origem de uma execução ou exceção.',
          ],
          [
            'O que significa “deprecate”?',
            'Marcar um recurso como obsoleto ou desaconselhado, geralmente com aviso de remoção futura.',
          ],
        ],
      },
    ],
  },
  {
    name: 'Bruno Lima',
    email: 'bruno.lima@demo.memora.local',
    decks: [
      {
        name: 'Algoritmos e Complexidade',
        description: 'Análise assintótica e estratégias comuns de algoritmos.',
        cards: [
          [
            'O que descreve a notação O grande?',
            'Um limite assintótico superior para o crescimento de uma função, abstraindo constantes.',
          ],
          [
            'Qual a complexidade de uma busca binária em vetor ordenado?',
            'O(log n), pois o espaço de busca é reduzido pela metade a cada etapa.',
          ],
          [
            'Qual a complexidade típica do Merge Sort?',
            'O(n log n) no melhor, médio e pior caso; usa espaço auxiliar em implementações usuais.',
          ],
          [
            'Qual o pior caso do Quick Sort?',
            'O(n²), por exemplo quando as partições ficam muito desequilibradas.',
          ],
          [
            'O que é um algoritmo guloso?',
            'Um algoritmo que escolhe em cada etapa uma opção localmente ótima, quando isso é válido para o problema.',
          ],
          [
            'O que caracteriza programação dinâmica?',
            'Reutilizar resultados de subproblemas sobrepostos para evitar recomputações.',
          ],
          [
            'O que é um invariante de laço?',
            'Uma propriedade verdadeira antes e depois de cada iteração que ajuda a demonstrar correção.',
          ],
          [
            'O que é um problema NP-completo?',
            'Um problema em NP ao qual todo problema de NP pode ser reduzido em tempo polinomial.',
          ],
          [
            'O que significa estabilidade em uma ordenação?',
            'Elementos com chaves iguais preservam sua ordem relativa original.',
          ],
          [
            'Qual a complexidade de percorrer todos os elementos de um vetor?',
            'O(n), pois cada um dos n elementos é processado uma vez.',
          ],
        ],
      },
      {
        name: 'Sistemas Operacionais',
        description: null,
        cards: [
          [
            'O que é um processo?',
            'Uma instância de programa em execução, com estado e recursos associados.',
          ],
          [
            'O que é uma thread?',
            'Uma linha de execução dentro de um processo que compartilha seu espaço de endereçamento.',
          ],
          [
            'Qual a diferença entre processo e thread?',
            'Processos têm espaços de memória isolados; threads do mesmo processo compartilham memória e recursos.',
          ],
          [
            'O que é escalonamento de CPU?',
            'A decisão de qual tarefa pronta receberá tempo de processamento.',
          ],
          [
            'O que caracteriza uma condição de corrida?',
            'O resultado depende da ordem ou temporização de acessos concorrentes a estado compartilhado.',
          ],
          [
            'Para que serve um mutex?',
            'Proteger uma seção crítica permitindo que apenas uma thread por vez detenha o bloqueio.',
          ],
          [
            'Quais condições são necessárias para deadlock?',
            'Exclusão mútua, posse e espera, ausência de preempção e espera circular.',
          ],
          [
            'O que é memória virtual?',
            'Uma abstração que oferece a processos espaços de endereçamento independentes, apoiada pelo hardware e pelo SO.',
          ],
          [
            'O que é paginação?',
            'Dividir memória virtual e física em páginas e quadros de tamanho fixo.',
          ],
          [
            'O que é uma chamada de sistema?',
            'Uma interface controlada para um programa solicitar serviços ao kernel.',
          ],
        ],
      },
      {
        name: 'Programação Orientada a Objetos',
        description: 'Princípios de modelagem e relações entre objetos.',
        cards: [
          [
            'O que é encapsulamento?',
            'Agrupar estado e comportamento e controlar como o estado é acessado ou alterado.',
          ],
          [
            'O que é abstração em POO?',
            'Representar aspectos relevantes de um conceito e ocultar detalhes não necessários ao uso.',
          ],
          [
            'O que é herança?',
            'Um mecanismo pelo qual um tipo derivado reutiliza ou especializa membros de um tipo base.',
          ],
          [
            'O que é polimorfismo?',
            'A capacidade de usar uma interface comum com implementações diferentes conforme o tipo concreto.',
          ],
          [
            'O que caracteriza composição?',
            'Construir um objeto a partir de outros objetos, delegando-lhes responsabilidades.',
          ],
          [
            'O que é uma interface?',
            'Um contrato de operações que tipos podem implementar, conforme a linguagem.',
          ],
          [
            'O que é uma classe?',
            'Uma definição de dados e operações a partir da qual objetos podem ser criados.',
          ],
          [
            'O que é um objeto?',
            'Uma entidade em execução que combina identidade, estado e comportamento.',
          ],
          [
            'O que significa coesão alta?',
            'Que os elementos de um módulo colaboram de forma focada em responsabilidades relacionadas.',
          ],
          [
            'O que significa acoplamento baixo?',
            'Que módulos dependem pouco de detalhes internos uns dos outros.',
          ],
        ],
      },
    ],
  },
  {
    name: 'Carla Mendes',
    email: 'carla.mendes@demo.memora.local',
    decks: [
      {
        name: 'Lógica de Programação',
        description:
          'Fundamentos de condições, repetição e decomposição de problemas.',
        cards: [
          [
            'O que é uma variável?',
            'Um nome associado a um valor armazenado ou calculado durante a execução.',
          ],
          [
            'Para que serve uma estrutura condicional?',
            'Escolher qual bloco executar com base no resultado de uma expressão booleana.',
          ],
          [
            'O que é um laço de repetição?',
            'Uma estrutura que executa um bloco repetidamente enquanto uma condição ou sequência determinar.',
          ],
          [
            'O que é uma função?',
            'Uma unidade nomeada de código que pode receber parâmetros e produzir um resultado.',
          ],
          [
            'O que é um parâmetro?',
            'Uma variável declarada na função que recebe um valor fornecido na chamada.',
          ],
          [
            'O que é um valor booleano?',
            'Um valor lógico que representa verdadeiro ou falso.',
          ],
          [
            'O que é decomposição de problema?',
            'Dividir um problema maior em partes menores e mais manejáveis.',
          ],
          [
            'O que é um algoritmo?',
            'Uma sequência finita e definida de passos para resolver um problema ou executar uma tarefa.',
          ],
        ],
      },
      {
        name: 'HTML e CSS Básico',
        description: null,
        cards: [
          [
            'Qual é a função do HTML?',
            'Descrever a estrutura e o significado do conteúdo de uma página Web.',
          ],
          [
            'Qual é a função do CSS?',
            'Definir apresentação visual e layout de documentos, incluindo páginas HTML.',
          ],
          [
            'Para que serve o elemento <a>?',
            'Criar um hiperlink para outro recurso ou local da página.',
          ],
          [
            'Qual a diferença entre class e id no HTML?',
            'class pode ser reutilizada; id deve identificar unicamente um elemento no documento.',
          ],
          [
            'O que o modelo de caixa CSS inclui?',
            'Conteúdo, padding, borda e margem.',
          ],
          [
            'O que faz display: flex?',
            'Cria um contêiner flexível para organizar itens em uma dimensão principal.',
          ],
          [
            'O que é design responsivo?',
            'Uma abordagem de layout que se adapta a diferentes tamanhos de tela e contextos de uso.',
          ],
          [
            'Para que serve o atributo alt em uma imagem?',
            'Fornecer texto alternativo que comunica a finalidade ou conteúdo da imagem.',
          ],
        ],
      },
    ],
  },
  {
    name: 'Diego Rocha',
    email: 'diego.rocha@demo.memora.local',
    decks: [],
  },
];

const intervaloPorNota: Record<Nota, number> = {
  [Nota.errei]: 0,
  [Nota.dificil]: 1,
  [Nota.bom]: 3,
  [Nota.facil]: 7,
};

const formatoData = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const formatoRelogio = new Intl.DateTimeFormat('en-US', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function partesDaData(data: Date, formato: Intl.DateTimeFormat) {
  return Object.fromEntries(
    formato.formatToParts(data).map(({ type, value }) => [type, value]),
  );
}

function deslocarDia(chave: string, dias: number): string {
  const [ano, mes, dia] = chave.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia + dias));
  return data.toISOString().slice(0, 10);
}

function dataNoFusoSaoPaulo(chave: string, hora: number, minuto: number): Date {
  const [ano, mes, dia] = chave.split('-').map(Number);
  const horarioLocalComoUtc = Date.UTC(ano, mes - 1, dia, hora, minuto);
  const estimativa = new Date(horarioLocalComoUtc);
  const partes = partesDaData(estimativa, formatoRelogio);
  const horarioObservadoComoUtc = Date.UTC(
    Number(partes.year),
    Number(partes.month) - 1,
    Number(partes.day),
    Number(partes.hour),
    Number(partes.minute),
  );
  return new Date(
    horarioLocalComoUtc - (horarioObservadoComoUtc - horarioLocalComoUtc),
  );
}

function notaHistorica(indiceCartao: number, indiceRevisao: number): Nota {
  const valor = (indiceCartao * 7 + indiceRevisao * 11) % 20;
  if (valor === 0) return Nota.errei;
  if (valor <= 3) return Nota.dificil;
  if (valor <= 12) return Nota.bom;
  return Nota.facil;
}

function notaFinal(indiceCartao: number, futuro: boolean): Nota {
  if (futuro) return indiceCartao % 3 === 0 ? Nota.bom : Nota.facil;
  const valor = (indiceCartao * 13 + 5) % 20;
  if (valor === 0) return Nota.errei;
  if (valor <= 3) return Nota.dificil;
  if (valor <= 11) return Nota.bom;
  return Nota.facil;
}

function planoDoCartao(
  email: string,
  deckName: string,
  front: string,
  back: string,
  indice: number,
  hoje: string,
  horaAtual: number,
): CardPlan {
  const ana = email === 'ana.souza@demo.memora.local';
  const bruno = email === 'bruno.lima@demo.memora.local';
  const carla = email === 'carla.mendes@demo.memora.local';

  if ((ana && indice < 9) || (bruno && indice < 4) || (carla && indice >= 5)) {
    return {
      email,
      deckName,
      front,
      back,
      repetitions: 0,
      intervalDays: 0,
      nextReview: new Date(),
      lastReview: null,
      reviews: [],
    };
  }

  const indiceEstudado = ana ? indice - 9 : bruno ? indice - 4 : indice;
  const totalRevisoes = ana
    ? 2 + (indiceEstudado % 3)
    : bruno
      ? 1 + (indiceEstudado % 3)
      : 1 + (indiceEstudado % 2);
  let ultimaNota: Nota;
  let deslocamentoUltimaRevisao: number;

  if (carla) {
    ultimaNota = notaFinal(indice, false);
    deslocamentoUltimaRevisao = -(indiceEstudado % 2);
  } else if (ana && indiceEstudado < 7) {
    ultimaNota = Nota.bom;
    deslocamentoUltimaRevisao = -indiceEstudado;
  } else {
    const futuro = (ana && indice >= 24) || (bruno && indice >= 12);
    ultimaNota = notaFinal(indiceEstudado, futuro);
    const intervaloFinal = intervaloPorNota[ultimaNota];
    if (futuro) {
      const deslocamentoProximaRevisao = 1 + (indiceEstudado % intervaloFinal);
      deslocamentoUltimaRevisao = deslocamentoProximaRevisao - intervaloFinal;
    } else {
      const deslocamentoProximaRevisao = -((indiceEstudado % 5) + 1);
      deslocamentoUltimaRevisao = deslocamentoProximaRevisao - intervaloFinal;
    }
  }

  const revisoes: CardPlan['reviews'] = [];
  let intervaloAnteriorDias = 0;
  for (
    let indiceRevisao = 0;
    indiceRevisao < totalRevisoes;
    indiceRevisao += 1
  ) {
    const ultima = indiceRevisao === totalRevisoes - 1;
    const nota = ultima ? ultimaNota : notaHistorica(indice, indiceRevisao);
    const intervaloNovoDias = intervaloPorNota[nota];
    const diasAntesDaUltima = totalRevisoes - indiceRevisao - 1;
    const intervaloEntreRevisoes = carla
      ? 1
      : 8 + ((indice + indiceRevisao) % 5);
    const deslocamento =
      deslocamentoUltimaRevisao - diasAntesDaUltima * intervaloEntreRevisoes;
    const dia = deslocarDia(hoje, deslocamento);
    const partesAgora = partesDaData(new Date(), formatoRelogio);
    const horaHoje = Math.max(8, Math.min(22, horaAtual - 1));
    const hora =
      deslocamento === 0
        ? horaHoje
        : 8 + ((indice * 3 + indiceRevisao * 5) % 15);
    const minuto =
      deslocamento === 0
        ? Math.min(Number(partesAgora.minute), 59)
        : (indice * 7 + indiceRevisao * 13) % 60;
    const revisadoEm = dataNoFusoSaoPaulo(dia, hora, minuto);

    revisoes.push({
      note: nota,
      previousIntervalDays: intervaloAnteriorDias,
      newIntervalDays: intervaloNovoDias,
      reviewedAt: revisadoEm,
    });
    intervaloAnteriorDias = intervaloNovoDias;
  }

  const ultimaRevisao = revisoes[revisoes.length - 1].reviewedAt;
  const intervaloDias = revisoes[revisoes.length - 1].newIntervalDays;

  return {
    email,
    deckName,
    front,
    back,
    repetitions: revisoes.length,
    intervalDays: intervaloDias,
    lastReview: ultimaRevisao,
    nextReview: new Date(ultimaRevisao.getTime() + intervaloDias * DAY_MS),
    reviews: revisoes,
  };
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'A seed de demonstração não pode ser executada em produção.',
    );
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('A variável de ambiente DATABASE_URL é obrigatória.');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const emailsDemo = usuariosDemo.map(({ email }) => email);
    const conflitoAdministrador = await prisma.usuario.findFirst({
      where: { email: { in: emailsDemo }, perfil: Perfil.administrador },
      select: { id: true },
    });
    if (conflitoAdministrador) {
      throw new Error(
        'Um email reservado para demonstração pertence a um administrador; nenhuma conta foi removida.',
      );
    }

    const usuariosRemovidos = await prisma.usuario.deleteMany({
      where: {
        email: { endsWith: DEMO_DOMAIN },
        perfil: { not: Perfil.administrador },
      },
    });
    const usuariosDemoRemanescentes = await prisma.usuario.count({
      where: { email: { in: emailsDemo } },
    });
    if (usuariosDemoRemanescentes > 0) {
      throw new Error(
        'Não foi possível remover todas as contas demo existentes; nenhuma conta nova foi criada.',
      );
    }

    const usuarios = await Promise.all(
      usuariosDemo.map(async (usuario) => ({
        nome: usuario.name,
        email: usuario.email,
        senhaHash: await bcrypt.hash(DEMO_PASSWORD, BCRYPT_COST),
        perfil: Perfil.estudante,
      })),
    );
    await prisma.usuario.createMany({ data: usuarios });

    const usuariosCriados = await prisma.usuario.findMany({
      where: { email: { in: usuariosDemo.map(({ email }) => email) } },
      select: { id: true, email: true },
    });
    const idUsuarioPorEmail = new Map(
      usuariosCriados.map(({ id, email }) => [email, id]),
    );
    const baralhos = usuariosDemo.flatMap((usuario) =>
      usuario.decks.map((baralho) => ({
        nome: baralho.name,
        descricao: baralho.description,
        usuarioId: idUsuarioPorEmail.get(usuario.email)!,
      })),
    );
    await prisma.baralho.createMany({ data: baralhos });

    const baralhosCriados = await prisma.baralho.findMany({
      where: { usuarioId: { in: usuariosCriados.map(({ id }) => id) } },
      select: { id: true, nome: true, usuario: { select: { email: true } } },
    });
    const idBaralhoPorUsuarioENome = new Map(
      baralhosCriados.map((baralho) => [
        `${baralho.usuario.email}\u0000${baralho.nome}`,
        baralho.id,
      ]),
    );
    const agora = new Date();
    const partesHoje = partesDaData(agora, formatoData);
    const hoje = `${partesHoje.year}-${partesHoje.month}-${partesHoje.day}`;
    const partesAgora = partesDaData(agora, formatoRelogio);
    const horaAtual = Number(partesAgora.hour);
    const planos = usuariosDemo.flatMap((usuario) => {
      let indiceDoCartao = 0;
      return usuario.decks.flatMap((baralho) =>
        baralho.cards.map(([front, back]) => {
          const plano = planoDoCartao(
            usuario.email,
            baralho.name,
            front,
            back,
            indiceDoCartao,
            hoje,
            horaAtual,
          );
          indiceDoCartao += 1;
          return plano;
        }),
      );
    });

    await prisma.cartao.createMany({
      data: planos.map((plano) => ({
        frente: plano.front,
        verso: plano.back,
        baralhoId: idBaralhoPorUsuarioENome.get(
          `${plano.email}\u0000${plano.deckName}`,
        )!,
        facilidade: 2.5,
        repeticoes: plano.repetitions,
        intervaloDias: plano.intervalDays,
        proximaRevisao: plano.nextReview,
        ultimaRevisao: plano.lastReview,
      })),
    });

    const baralhoIds = baralhosCriados.map(({ id }) => id);
    const cartoesCriados = await prisma.cartao.findMany({
      where: { baralhoId: { in: baralhoIds } },
      select: { id: true, frente: true, baralhoId: true },
    });
    const idCartaoPorBaralhoEFrente = new Map(
      cartoesCriados.map((cartao) => [
        `${cartao.baralhoId}\u0000${cartao.frente}`,
        cartao.id,
      ]),
    );
    const revisoes = planos.flatMap((plano) => {
      const baralhoId = idBaralhoPorUsuarioENome.get(
        `${plano.email}\u0000${plano.deckName}`,
      )!;
      const cartaoId = idCartaoPorBaralhoEFrente.get(
        `${baralhoId}\u0000${plano.front}`,
      )!;
      return plano.reviews.map((revisao) => ({
        cartaoId,
        nota: revisao.note,
        intervaloAnteriorDias: revisao.previousIntervalDays,
        intervaloNovoDias: revisao.newIntervalDays,
        revisadoEm: revisao.reviewedAt,
      }));
    });
    if (revisoes.length > 0) {
      await prisma.revisao.createMany({ data: revisoes });
    }

    console.info('Seed de demonstração concluída:');
    console.info(
      `Usuários: ${usuariosCriados.length} | Baralhos: ${baralhos.length} | Cartões: ${planos.length} | Revisões: ${revisoes.length} | Contas demo substituídas: ${usuariosRemovidos.count}`,
    );
    console.table(
      usuariosDemo.map(({ email }) => ({ email, senha: DEMO_PASSWORD })),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((erro: unknown) => {
  console.error('Falha ao executar a seed de demonstração.', erro);
  process.exitCode = 1;
});
