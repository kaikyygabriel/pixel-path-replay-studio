
/**
 * Store identity. Fields set to null are business details the owner has not
 * supplied yet — the UI shows them as pending instead of inventing values.
 */
export const store = {
  name: "MULTI ACHADINHOS",
  brandName: "Multi Achadinhos",
  logo: "/logo%20loja.png",
  followers: "+43 mil seguidores",
  bio: "Multi Achadinhos | Variedade para o seu dia a dia! Eletrônicos, casa, utilidades e muito mais. Explore nossa vitrine e encontre seus próximos achadinhos! ❤️",
  legal: {
    razaoSocial: "MULTI ACHADINHOS LTDA" as string | null,
    cnpj: "67.705.006/0001-35" as string | null,
    sede: "São Paulo - SP" as string | null,
    atendimento: "sac@multiachadinhos.tiktokshop" as string | null,
  },
};

export type Variant = {
  id: string;
  line: string;
  color: string;
  description: string;
  price: number; // cents
  original: number; // cents
  pieces: number;
  image: string;
};

export type Product = {
  id: string;
  title: string;
  cardTitle: string;
  checkoutTitle: string;
  category: string;
  price: number;
  original: number;
  shippingOriginal: number;
  image: string;
  gallery: string[];
  variants: Variant[];
  /** Real store metrics only; null = not shown. */
  rating: number | null;
  reviews: number | null;
  sold: string | null;
  description?: string;
  /** Explicitly marked flash offer; each product receives its own persisted countdown. */
  flashOffer?: { endsAt?: number; minDurationSeconds?: number; maxDurationSeconds?: number };
};

const towelVariants: Variant[] = [
  { id: "bosco-azul", line: "Bosco", color: "Azul Serena/Azul Naval", description: "2 toalhas de banho e 2 de rosto · Bosco · Azul Serena/Azul Naval · frete grátis", price: 3798, original: 12841, pieces: 4, image: "/products/jogo-toalhas-karsten/gallery/towel-01-capa.png" },
  { id: "provence-branco", line: "Provence", color: "Branco/Argila", description: "2 toalhas de banho e 2 de rosto · Provence · Branco/Argila · frete grátis", price: 4691, original: 17990, pieces: 4, image: "/products/jogo-toalhas-karsten/gallery/towel-05.png" },
  { id: "bosco-cinza", line: "Bosco", color: "Cinza", description: "2 toalhas de banho e 2 de rosto · Bosco · Cinza · frete grátis", price: 3472, original: 10491, pieces: 4, image: "/products/jogo-toalhas-karsten/gallery/towel-08.png" },
  { id: "provence-verde", line: "Provence", color: "Verde", description: "2 toalhas de banho e 2 de rosto · Provence · Verde · frete grátis", price: 4491, original: 12990, pieces: 4, image: "/products/jogo-toalhas-karsten/gallery/towel-11.png" },
  { id: "bosco-bege", line: "Bosco", color: "Bege/Marrom", description: "2 toalhas de banho e 2 de rosto · Bosco · Bege/Marrom · frete grátis", price: 3499, original: 10899, pieces: 4, image: "/products/jogo-toalhas-karsten/gallery/towel-14.png" },
];

const mondialVariants: Variant[] = (["127V", "220V"] as const).flatMap((voltage) => [
  { id: `mondial-l99-${voltage.toLowerCase()}-preto`, line: voltage, color: "Preto", description: `Liquidificador Mondial Turbo Power L-99 FB · 550W · ${voltage} · Preto`, price: 4985, original: 17290, pieces: 1, image: "/products/liquidificador-mondial-l99-fb/variants/liquidificador-mondial-preto.webp" },
  { id: `mondial-l99-${voltage.toLowerCase()}-branco`, line: voltage, color: "Branco", description: `Liquidificador Mondial Turbo Power L-99 FB · 550W · ${voltage} · Branco`, price: 4985, original: 17290, pieces: 1, image: "/products/liquidificador-mondial-l99-fb/variants/liquidificador-mondial-branco.webp" },
  { id: `mondial-l99-${voltage.toLowerCase()}-vermelho`, line: voltage, color: "Vermelho", description: `Liquidificador Mondial Turbo Power L-99 FB · 550W · ${voltage} · Vermelho`, price: 4985, original: 17290, pieces: 1, image: "/products/liquidificador-mondial-l99-fb/variants/liquidificador-mondial-vermelho.webp" },
]);

export const products: Product[] = [
  {
    id: "jogo-toalhas-karsten",
    title: "Jogo de Toalhas Karsten · 4 Peças · Bosco e Provence",
    cardTitle: "Jogo de Toalhas Karsten · 4 Peças · Bosco e...",
    checkoutTitle: "Jogo de Toalhas Karsten Bosco · 4 Peças 100% Algodão",
    category: "Cama, Mesa e Banho · Casa & Utilidades · Mais vendidos · Recomendados",
    price: 3798,
    original: 12841,
    shippingOriginal: 2620,
    image: "/products/jogo-toalhas-karsten/gallery/towel-01-capa.png",
    gallery: [
      "/products/jogo-toalhas-karsten/gallery/towel-01-capa.png",
      "/products/jogo-toalhas-karsten/gallery/towel-02.png",
      "/products/jogo-toalhas-karsten/gallery/towel-03.png",
      "/products/jogo-toalhas-karsten/gallery/towel-04.png",
      "/products/jogo-toalhas-karsten/gallery/towel-05.png",
      "/products/jogo-toalhas-karsten/gallery/towel-06.png",
      "/products/jogo-toalhas-karsten/gallery/towel-07.png",
      "/products/jogo-toalhas-karsten/gallery/towel-08.png",
      "/products/jogo-toalhas-karsten/gallery/towel-09.png",
      "/products/jogo-toalhas-karsten/gallery/towel-10.png",
      "/products/jogo-toalhas-karsten/gallery/towel-11.png",
      "/products/jogo-toalhas-karsten/gallery/towel-12.png",
      "/products/jogo-toalhas-karsten/gallery/towel-13.png",
      "/products/jogo-toalhas-karsten/gallery/towel-14.png",
      "/products/jogo-toalhas-karsten/gallery/towel-15.png",
      "/products/jogo-toalhas-karsten/gallery/towel-16.png",
    ],
    variants: towelVariants,
    description: "O jogo de toalhas Karsten reúne 4 peças pensadas para trazer mais conforto, praticidade e harmonia à rotina. O conjunto é composto por 2 toalhas de banho de 135 × 70 cm e 2 toalhas de rosto, oferecendo opções para diferentes momentos do cuidado diário. Produzidas em 100% algodão, as peças combinam um toque agradável com um visual elegante, deixando o banheiro mais bonito e acolhedor. A composição coordenada facilita a organização e cria uma apresentação caprichada no ambiente, seja para renovar o enxoval da casa ou complementar a decoração do banheiro. Versátil e funcional, é aquele conjunto que une beleza e utilidade em um só produto, tornando os momentos depois do banho ainda mais agradáveis. As diferentes opções de cores permitem escolher a combinação que mais combina com seu espaço e seu estilo.",
    rating: 4.8, reviews: null, sold: "7,8 mil",
  },
  {
    id: "chaleira-unitermi-atacama",
    title: "Chaleira Elétrica Unitermi Atacama · 1,8L",
    cardTitle: "Chaleira Elétrica Unitermi Atacama · 1,8L",
    checkoutTitle: "Chaleira Elétrica Unitermi Atacama · 1,8L",
    category: "Eletroportáteis · Cozinha · Casa & Utilidades",
    price: 3623,
    original: 4990,
    shippingOriginal: 2620,
    image: "/products/chaleira-unitermi-atacama/gallery/chaleira-unitermi-1.png",
    gallery: [
      "/products/chaleira-unitermi-atacama/gallery/chaleira-unitermi-1.png",
      "/products/chaleira-unitermi-atacama/gallery/chaleira-unitermi-2.png",
      "/products/chaleira-unitermi-atacama/gallery/chaleira-unitermi-3.png",
      "/products/chaleira-unitermi-atacama/gallery/chaleira-unitermi-4.png",
      "/products/chaleira-unitermi-atacama/gallery/chaleira-unitermi-5.png",
    ],
    variants: [
      { id: "chaleira-127v", line: "Tensão", color: "127V", description: "Versão 127V", price: 3623, original: 4990, pieces: 1, image: "/products/chaleira-unitermi-atacama/variants/chaleira-unitermi-capa.png" },
      { id: "chaleira-220v", line: "Tensão", color: "220V", description: "Versão 220V", price: 3623, original: 4990, pieces: 1, image: "/products/chaleira-unitermi-atacama/variants/chaleira-unitermi-capa.png" },
    ],
    description: "Prepare café, chá, chimarrão e outras bebidas com praticidade. A chaleira elétrica tem capacidade de 1,8 L, acabamento em aço inox e aquecimento rápido, ideal para casa ou trabalho.\n\nDisponível em 127V ou 220V. Não é bivolt: selecione a voltagem compatível com sua residência antes de comprar.",
    rating: 4.7, reviews: null, sold: "2,4 mil",
  },
  {
    id: "arvore-natal-kit-87-enfeites",
    title: "Árvore de Natal 1,20 m + Kit com 87 Enfeites",
    cardTitle: "Árvore de Natal 1,20 m + 87 Enfeites",
    checkoutTitle: "Árvore de Natal 1,20 m com Kit de 87 Enfeites",
    category: "Natal · Decoração · Presentes",
    price: 4285,
    original: 9299,
    shippingOriginal: 2620,
    image: "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-capa-oficial.png",
    gallery: [
      "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-capa-oficial.png",
      "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-2.png",
      "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-3.png",
      "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-4.png",
      "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-5.png",
      "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-6.png",
      "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-7.png",
    ],
    variants: [
      { id: "arvore-127v", line: "Tensão", color: "127V", description: "Versão 127V · Árvore de Natal com pisca-pisca", price: 4285, original: 9299, pieces: 1, image: "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-capa-oficial.png" },
      { id: "arvore-220v", line: "Tensão", color: "220V", description: "Versão 220V · Árvore de Natal com pisca-pisca", price: 4285, original: 9299, pieces: 1, image: "/products/arvore-natal-kit-87-enfeites/arvore-de-natal-capa-oficial.png" },
    ],
    description: "Deixe a decoração de fim de ano pronta com uma árvore de 1,20 m e um kit com 87 enfeites variados. Compacta, reutilizável e fácil de montar, é ideal para ambientes internos.\n\nA árvore possui 110 galhos verdes, estrutura flexível e pés em PVC reforçado. O kit inclui ponteira estrela, pisca-pisca, festão, 6 laços, 12 bolinhas e 66 pendentes decorativos.\n\nEscolha a voltagem do pisca-pisca: 127V ou 220V. Cores e modelos dos enfeites podem variar conforme a disponibilidade. Imagens ilustrativas.",
    rating: 5,
    reviews: null,
    sold: "800+",
  },
  {
    id: "smart-tv-tcl-55p8k-qled-4k",
    title: "Smart TV TCL 55” QLED 4K Google TV · 144 Hz",
    cardTitle: "Smart TV TCL 55” QLED 4K · 144 Hz",
    checkoutTitle: "Smart TV TCL 55P8K QLED 4K 55 polegadas",
    category: "Eletrônicos · TVs e Vídeo · Recomendados · Natal · 25.12 · Presentes",
    price: 83765,
    original: 275405,
    shippingOriginal: 2620,
    image: "/products/smart-tv-tcl-55p8k-qled-4k/gallery/tcl%20tv%201.png",
    gallery: [
      "/products/smart-tv-tcl-55p8k-qled-4k/gallery/tcl%20tv%201.png",
      "/products/smart-tv-tcl-55p8k-qled-4k/gallery/tcl%20tv%202.png",
      "/products/smart-tv-tcl-55p8k-qled-4k/gallery/tcl%20tv%203.png",
      "/products/smart-tv-tcl-55p8k-qled-4k/gallery/tcl%20tv%204.png",
      "/products/smart-tv-tcl-55p8k-qled-4k/gallery/tcl%20tv%205.png",
      "/products/smart-tv-tcl-55p8k-qled-4k/gallery/tcl%20tv%206.png",
    ],
    variants: [],
    description: "Tenha uma experiência de entretenimento imersiva com a Smart TV TCL 55P8K. Tela QLED 4K de 55 polegadas, painel HVA e frequência real de 144 Hz para imagens nítidas, cores vibrantes e movimentos fluidos.\n\nCom Google TV, Google Assistente, Google Cast, Wi-Fi Dual Band e Bluetooth 5.4, oferece acesso prático aos principais aplicativos de streaming. Conta ainda com HDR10+, Dolby Vision e sistema de áudio 2.1 canais com subwoofer e Dolby Audio.\n\nPossui 4 entradas HDMI, 2 USB, HDMI 2.1, eARC e padrão VESA 300 × 300 mm. Alimentação automática de 100–240 V.\n\nDimensões com pedestal: 77,5 × 122,6 × 28,9 cm. Peso: 11,5 kg. Acompanha controle remoto e manual.",
    rating: 4.9, reviews: null, sold: "10 mil+",
  },
  {
    id: "liquidificador-mondial-l99-fb",
    title: "Liquidificador Turbo Power Mondial Preto 550W L-99 FB",
    cardTitle: "Liquidificador Mondial Turbo Power 550W",
    checkoutTitle: "Liquidificador Turbo Power Mondial L-99 FB 550W",
    category: "Eletroportáteis · Cozinha · Casa & Utilidades · Mais vendidos",
    price: 4985,
    original: 17290,
    shippingOriginal: 2620,
    image: "/products/liquidificador-mondial-l99-fb/variants/liquidificador-mondial-preto.webp",
    gallery: [
      "/products/liquidificador-mondial-l99-fb/variants/liquidificador-mondial-preto.webp",
      "/products/liquidificador-mondial-l99-fb/gallery/liquidificador-mondial-preto-2.webp",
      "/products/liquidificador-mondial-l99-fb/gallery/liquidificador-mondial-preto-3.webp",
      "/products/liquidificador-mondial-l99-fb/gallery/liquidificador-mondial-preto-4.webp",
      "/products/liquidificador-mondial-l99-fb/gallery/liquidificador-mondial-preto-5.webp",
    ],
    variants: mondialVariants,
    description: "Liquidificador Turbo Power Mondial L-99 FB com potência de 550W, disponível nas cores preto, branco e vermelho. Escolha primeiro a voltagem compatível com sua residência e depois a cor desejada. As versões 127V e 220V são opções distintas, não bivolt.",
    rating: 4.9, reviews: null, sold: "12,5 mil",
  },
  {
    id: "micro-ondas-philco-pmo31s",
    title: "Micro-ondas Philco 28L 1100W PMO31S Tira Odor",
    cardTitle: "Micro-ondas Philco 28L 1100W PMO31S",
    checkoutTitle: "Micro-ondas Philco PMO31S 28L 1100W Tira Odor",
    category: "Eletroportáteis · Cozinha · Casa & Utilidades · Mais vendidos · Recomendados",
    price: 12785,
    original: 52990,
    shippingOriginal: 2620,
    image: "/products/micro-ondas-philco-pmo31s/gallery/micro-ondas-philco-capa.png",
    gallery: [
      "/products/micro-ondas-philco-pmo31s/gallery/micro-ondas-philco-capa.png",
      "/products/micro-ondas-philco-pmo31s/gallery/micro-ondas-philco-2.png",
      "/products/micro-ondas-philco-pmo31s/gallery/micro-ondas-philco-3.png",
      "/products/micro-ondas-philco-pmo31s/gallery/micro-ondas-philco-4.png",
      "/products/micro-ondas-philco-pmo31s/gallery/micro-ondas-philco-5.png",
      "/products/micro-ondas-philco-pmo31s/gallery/micro-ondas-philco-6.png",
      "/products/micro-ondas-philco-pmo31s/gallery/micro-ondas-philco-7.png",
      "/products/micro-ondas-philco-pmo31s/gallery/micro-ondas-philco-8.png",
      "/products/micro-ondas-philco-pmo31s/gallery/micro-ondas-philco-9.png",
    ],
    variants: [
      { id: "philco-pmo31s-127v", line: "Tensão", color: "127V", description: "Micro-ondas Philco PMO31S 28L · 1100W · 127V", price: 12785, original: 52990, pieces: 1, image: "/products/micro-ondas-philco-pmo31s/gallery/micro-ondas-philco-capa.png" },
      { id: "philco-pmo31s-220v", line: "Tensão", color: "220V", description: "Micro-ondas Philco PMO31S 28L · 1100W · 220V", price: 12785, original: 52990, pieces: 1, image: "/products/micro-ondas-philco-pmo31s/gallery/micro-ondas-philco-capa.png" },
    ],
    description: "O Micro-ondas Philco PMO31S 28L 1100W traz potência e praticidade para facilitar sua rotina na cozinha. Com capacidade de 28 litros, ele oferece espaço para diferentes recipientes e potência de 1100W para aquecer, cozinhar e descongelar alimentos com eficiência.\n\nA Pintura Limpa Fácil facilita a limpeza do interior, enquanto a Função Tira Odor ajuda a eliminar cheiros indesejáveis após o preparo. O micro-ondas também possui classificação energética A, contribuindo para mais eficiência no uso diário.\n\nPara deixar o preparo ainda mais simples, o PMO31S conta com 10 níveis de potência, descongelamento por tempo ou peso, funções de cozinhar por tempo ou peso e receitas pré-programadas. São opções para preparar lasanha, pizza, pipoca, brigadeiro e bolo de caneca, além do Menu Fit com sopa, batatas e legumes.\n\nO Micro-ondas Philco PMO31S também conta com função Manter Aquecido, +30 segundos, relógio digital, trava de segurança e possibilidade de desligar o display e os sons. Com 28L de capacidade e 1100W de potência, reúne recursos para tornar o preparo dos alimentos mais prático no dia a dia.\n\nDisponível em 127V ou 220V. Não é bivolt: selecione a voltagem compatível com sua residência antes de comprar.",
    rating: 4.8, reviews: null, sold: "500+",
  },
  {
    id: "ar-condicionado-lg-ai-voice-9000",
    title: "Ar-Condicionado Split LG AI Voice Inverter 9.000 BTUs Frio Wi-Fi",
    cardTitle: "Ar-Condicionado LG AI Voice Inverter 9.000 BTUs",
    checkoutTitle: "Ar-Condicionado Split LG AI Voice Inverter 9.000 BTUs Frio 220V",
    category: "Climatização · Eletroportáteis · Casa & Utilidades · Mais vendidos · Recomendados",
    price: 69327,
    original: 217800,
    shippingOriginal: 2620,
    image: "/products/ar-condicionado-lg-ai-voice-9000/gallery/ar-condicionado-lg-capa.png",
    gallery: [
      "/products/ar-condicionado-lg-ai-voice-9000/gallery/ar-condicionado-lg-capa.png",
      "/products/ar-condicionado-lg-ai-voice-9000/gallery/ar-condicionado-lg-2.png",
      "/products/ar-condicionado-lg-ai-voice-9000/gallery/ar-condicionado-lg-3.png",
      "/products/ar-condicionado-lg-ai-voice-9000/gallery/ar-condicionado-lg-4.png",
      "/products/ar-condicionado-lg-ai-voice-9000/gallery/ar-condicionado-lg-5.png",
      "/products/ar-condicionado-lg-ai-voice-9000/gallery/ar-condicionado-lg-6.png",
    ],
    variants: [],
    description: "O Ar-Condicionado Split LG AI Smart Inverter Voice de 9.000 BTUs oferece climatização fria com conectividade e controle inteligente. A tecnologia AI SmartCare ajusta o funcionamento de acordo com os hábitos de uso, enquanto o compressor Inverter ajuda a manter a temperatura com mais estabilidade.\n\nPelo aplicativo LG ThinQ, é possível ligar e desligar o aparelho, programar horários, ajustar funções e acompanhar o consumo à distância. O modelo também é compatível com comandos de voz por Google Assistente e Alexa.\n\nCom operação silenciosa, serpentina de cobre com proteção GoldFin e gás refrigerante R-32, é indicado para ambientes de até aproximadamente 12 m², conforme as condições do local.\n\n**Especificações principais:** 9.000 BTUs · ciclo frio · tecnologia Inverter · Wi-Fi · 220V monofásico · gás R-32 · serpentina de cobre · classificação energética B · consumo informado de 363,4 kWh/ano.\n\n**Atenção:** produto disponível exclusivamente em 220V. Não é bivolt. Verifique a instalação elétrica e as condições do ambiente antes da compra. A instalação deve ser realizada por profissional qualificado.",
    rating: 5, reviews: null, sold: "1.000+",
  },
  {
    id: "air-fryer-oven-mondial-afon-12l",
    title: "Fritadeira Air Fryer Oven Mondial 12L Digital 2200W AFON-12L-BI",
    cardTitle: "Air Fryer Oven Mondial 12L Digital",
    checkoutTitle: "Fritadeira Air Fryer Oven Mondial AFON-12L-BI 12L 2200W",
    category: "Eletroportáteis · Cozinha · Casa & Utilidades · Mais vendidos · Recomendados",
    price: 8479,
    original: 44922,
    shippingOriginal: 2620,
    image: "/products/air-fryer-oven-mondial-afon-12l/gallery/air-fryer-mondial-capa.png",
    gallery: [
      "/products/air-fryer-oven-mondial-afon-12l/gallery/air-fryer-mondial-capa.png",
      "/products/air-fryer-oven-mondial-afon-12l/gallery/air-fryer-mondial-2.png",
      "/products/air-fryer-oven-mondial-afon-12l/gallery/air-fryer-mondial-3.png",
      "/products/air-fryer-oven-mondial-afon-12l/gallery/air-fryer-mondial-4.png",
      "/products/air-fryer-oven-mondial-afon-12l/gallery/air-fryer-mondial-5.png",
      "/products/air-fryer-oven-mondial-afon-12l/gallery/air-fryer-mondial-6.png",
      "/products/air-fryer-oven-mondial-afon-12l/gallery/air-fryer-mondial-7.png",
    ],
    variants: [
      { id: "air-fryer-mondial-127v", line: "Voltagem", color: "127V", description: "Air Fryer Oven Mondial AFON-12L-BI · 12L · 2200W · 127V", price: 8479, original: 44922, pieces: 1, image: "/products/air-fryer-oven-mondial-afon-12l/gallery/air-fryer-mondial-capa.png" },
      { id: "air-fryer-mondial-220v", line: "Voltagem", color: "220V", description: "Air Fryer Oven Mondial AFON-12L-BI · 12L · 2200W · 220V", price: 8479, original: 44922, pieces: 1, image: "/products/air-fryer-oven-mondial-afon-12l/gallery/air-fryer-mondial-capa.png" },
    ],
    description: "A Fritadeira Air Fryer Oven Mondial AFON-12L-BI reúne capacidade, potência e praticidade para preparar diferentes receitas em casa. Com 12 litros de capacidade total e potência de 2.200 W, oferece espaço para preparar porções maiores de uma só vez.\n\nO painel digital conta com 10 funções predefinidas, que facilitam a escolha do preparo e ajustam automaticamente tempo e temperatura. Durante o funcionamento, é possível regular a temperatura entre 80 °C e 200 °C conforme a receita.\n\nA janela transparente com iluminação interna permite acompanhar os alimentos sem precisar abrir a porta. O conjunto acompanha 3 prateleiras e um cesto de 5 litros com revestimento antiaderente, ampliando as possibilidades de preparo e facilitando a rotina na cozinha.\n\n**Especificações principais:** capacidade total de 12 L · potência de 2.200 W · painel digital · 10 funções predefinidas · temperatura ajustável de 80 °C a 200 °C · janela transparente com iluminação interna · 3 prateleiras · cesto de 5 L com revestimento antiaderente.\n\n**Atenção:** disponível nas versões 127V e 220V. Não é bivolt. Confira a voltagem da sua residência e selecione a opção correspondente antes de finalizar a compra.",
    rating: 4.9, reviews: null, sold: "15.000+",
  },
  {
    id: "squishy-surpresa-colecionavel",
    title: "Squishy Surpresa Colecionável Antiestresse · Modelo Sortido",
    cardTitle: "Squishy Surpresa Colecionável",
    checkoutTitle: "Squishy Surpresa Colecionável Antiestresse · 1 Unidade",
    category: "Brinquedos · Infantil · Colecionáveis · Presentes · Natal · 25.12",
    price: 1995,
    original: 3990,
    shippingOriginal: 2620,
    image: "/products/squishy-surpresa-colecionavel/gallery/squishy-capa.png",
    gallery: [
      "/products/squishy-surpresa-colecionavel/gallery/squishy-capa.png",
      "/products/squishy-surpresa-colecionavel/gallery/squishy-carrossel-04.png",
      "/products/squishy-surpresa-colecionavel/gallery/squishy-carrossel-05.png",
      "/products/squishy-surpresa-colecionavel/gallery/squishy-carrossel-06.png",
    ],
    variants: [],
    description: "Descubra qual modelo vai chegar! O Squishy Surpresa Colecionável é um brinquedo de apertar, com toque macio, visual divertido e acabamento brilhante. Cada unidade vem em sua própria embalagem individual, e a abertura faz parte da experiência de descobrir a versão recebida.\n\nA coleção reúne diferentes modelos e cores, incluindo algumas versões especiais. O envio é sortido: a cor e o modelo são escolhidos aleatoriamente, sem possibilidade de selecionar uma versão específica e sem garantia de receber uma versão rara.\n\n**O que acompanha:** 1 squishy surpresa em sua embalagem individual.\n\n**Importante:** este anúncio corresponde a uma unidade, não a um kit. As outras cores, modelos e embalagens que aparecem nas imagens servem para apresentar a variedade da coleção; a caixa expositora e as demais unidades não acompanham a compra.",
    rating: 5.0, reviews: null, sold: "1.000+",
  },

  {
    id: "barbie-casa-dos-sonhos-hmx10",
    title: "Casa dos Sonhos Barbie Dreamhouse Mattel HMX10 · 3 Andares",
    cardTitle: "Casa dos Sonhos Barbie 3 Andares",
    checkoutTitle: "Casa dos Sonhos Barbie Dreamhouse Mattel HMX10 com 75+ Acessórios",
    category: "Brinquedos · Infantil · Casa de Bonecas · Presentes · Recomendados · Natal · 25.12",
    price: 29385,
    original: 129990,
    shippingOriginal: 2620,
    image: "/products/barbie-casa-dos-sonhos/gallery/barbie-casa-capa.png",
    gallery: [
      "/products/barbie-casa-dos-sonhos/gallery/barbie-casa-capa.png",
      "/products/barbie-casa-dos-sonhos/gallery/barbie-casa-carrossel-02.png",
      "/products/barbie-casa-dos-sonhos/gallery/barbie-casa-carrossel-03.png",
    ],
    variants: [],
    description: "A Barbie Dreamhouse HMX10 é uma casa de bonecas de três andares, com espaços internos e externos para brincar em 360 graus. São 10 áreas de convivência, incluindo ambientes de lazer, cozinha, sala, quarto, banheiro, varanda e uma piscina com escorregador em espiral de três andares.\n\nA brincadeira fica ainda mais completa com elevador funcional, recursos de luz e som na cozinha e no banheiro, além de áreas especiais para os pets, com elevador, escorregador e piscina próprios. No último andar, o espaço extra se transforma em uma área para festa do pijama, com lugar para até quatro bonecas.\n\nO conjunto acompanha mais de 75 peças e acessórios para personalizar os ambientes, incluindo um cachorrinho. É indicado para crianças a partir de 3 anos. A casa precisa ser montada e utiliza 3 pilhas AA, vendidas separadamente.\n\n**O que acompanha:** 1 Casa dos Sonhos Barbie de três andares e mais de 75 peças, incluindo um cachorrinho.\n\n**Importante:** as bonecas Barbie não estão incluídas. As pilhas AA necessárias para os efeitos de luz e som também são vendidas separadamente. A montagem é necessária; cores e decorações podem variar.",
    rating: 5.0, reviews: null, sold: "500+",
  },
  {
    id: "projetor-hy300-duoseg",
    title: "Projetor Portátil HY300 DUOSEG 4K HD Smart Android 11 · Wi-Fi Dual Band · Bluetooth 5.0",
    cardTitle: "Mini Projetor Smart HY300 4K",
    checkoutTitle: "Projetor Portátil Smart HY300 DUOSEG Android 11",
    category: "Eletrônicos · TVs e Vídeo · Áudio e Vídeo · Recomendados · Natal · 25.12 · Presentes",
    price: 5998,
    original: 16551,
    shippingOriginal: 2620,
    image: "/products/projetor-hy300-duoseg/gallery/projetor-hy300-capa.png",
    gallery: [
      "/products/projetor-hy300-duoseg/gallery/projetor-hy300-capa.png",
      "/products/projetor-hy300-duoseg/gallery/projetor-hy300-02.png",
      "/products/projetor-hy300-duoseg/gallery/projetor-hy300-03.png",
      "/products/projetor-hy300-duoseg/gallery/projetor-hy300-04.png",
      "/products/projetor-hy300-duoseg/gallery/projetor-hy300-05.png",
      "/products/projetor-hy300-duoseg/gallery/projetor-hy300-06.png",
      "/products/projetor-hy300-duoseg/gallery/projetor-hy300-07.png",
    ],
    variants: [],
    description: "Leve sua experiência de entretenimento para diferentes ambientes com o Projetor Smart HY300 DUOSEG. Seu corpo com rotação de 180° permite direcionar a projeção para a parede ou para o teto, enquanto a correção automática de keystone e o ajuste eletrônico ajudam a alinhar a imagem. O foco é manual.\n\nCom Android 11 integrado, o projetor oferece uma interface inteligente. A conexão Wi-Fi de banda dupla e o Bluetooth 5.0 ampliam as possibilidades de conexão. Também conta com entrada HDMI, USB e saída de áudio.\n\n**Imagem e projeção:** tamanho informado de 40 a 130 polegadas · distância de projeção de 1,2 a 4 metros · distância indicada como ideal de 1,68 metro · proporções 16:9 e 4:3 · contraste informado de 1500:1 · brilho informado de 200 lúmens ANSI e 8000 lm. Para melhor resultado, prefira ambientes com pouca luz; a imagem perde intensidade em locais muito iluminados.\n\n**Sistema e desempenho:** Android 11 · processador Allwinner H713 · GPU Mali-G31 com suporte informado a OpenGL ES 3.2, Vulkan 1.1 e OpenCL 2.0 · memória RAM de 1 GB · armazenamento interno de 8 GB · suporte a vários idiomas. A ficha informa suporte à decodificação de determinados formatos de vídeo em até 4K a 30 fps. Isso não significa necessariamente resolução nativa 4K: a resolução nativa não foi informada na ficha técnica.\n\n**Conexões:** Wi-Fi de banda dupla (módulo AW869A; a ficha do fornecedor menciona especificação Wi-Fi 6) · Bluetooth 5.0 · HDMI · USB · saída de áudio.\n\n**Formatos informados:** áudio MP3, WMA e AAC; imagens JPG, BMP e PNG; reprodução de vídeo com decodificação HEVC, VP9, AVS2 e AVC em até 4K a 30 fps, além de MPEG1, MPEG2 e AV1 em até 1080p a 60 fps, conforme compatibilidade do arquivo.\n\n**Outras especificações:** ruído informado de 25 dB · temperatura de cor aproximada de 8000 K (±1000 K) · alimentação AC indicada na ficha como 90–260 V, 50/60 Hz. Como a mesma ficha também menciona 110–220 V, confira a etiqueta do aparelho antes de conectar à tomada.\n\n**Conteúdo da embalagem:** 1 projetor · 1 controle remoto · 1 cabo de alimentação · 1 manual.\n\n**Atenção:** não desligue o projetor diretamente da tomada. Utilize o procedimento de desligamento pelo sistema antes de interromper a alimentação. As informações de brilho, compatibilidade e desempenho são as declaradas na ficha do produto e podem variar conforme o ambiente, a fonte de imagem e as condições de uso.\n\n**Termos relacionados:** projetor portátil · mini projetor smart · HY300 · projetor Android 11 · projetor Wi-Fi · projetor Bluetooth · projetor HDMI para notebook.",
    rating: 4.9,
    reviews: null,
    sold: "8.000+",
  },
  {
    id: "brastoy-controle-remoto-k602",
    title: "Brastoy Controle Remoto Recarregável 1:16 Off-road 4x4 Verde K602",
    cardTitle: "Carrinho Brastoy Off-road 4x4 RC 1:16",
    checkoutTitle: "Carrinho Brastoy Controle Remoto 4x4 K602 Verde",
    category: "Brinquedos · Infantil · Carrinhos e Controle Remoto · Presentes · Natal · 25.12",
    price: 11732,
    original: 39285,
    shippingOriginal: 2620,
    image: "/products/brastoy-controle-remoto-k602/gallery/brastoy-capa.png",
    gallery: [
      "/products/brastoy-controle-remoto-k602/gallery/brastoy-capa.png",
      "/products/brastoy-controle-remoto-k602/gallery/brastoy-carrossel-1.png",
      "/products/brastoy-controle-remoto-k602/gallery/brastoy-carrossel-2.png",
      "/products/brastoy-controle-remoto-k602/gallery/brastoy-carrossel-3.png",
      "/products/brastoy-controle-remoto-k602/gallery/brastoy-carrossel-4.png",
      "/products/brastoy-controle-remoto-k602/gallery/brastoy-carrossel-5.png",
      "/products/brastoy-controle-remoto-k602/gallery/brastoy-carrossel-6.png"
    ],
    variants: [],
    description: "Prepare-se para encarar diferentes terrenos com o Carrinho Off-road Brastoy K602. Em escala 1:16, ele combina tração 4x4, suspensão independente e estrutura resistente para uma brincadeira cheia de ação.\n\n**Desempenho off-road:** sistema 4x4 e suspensão independente, com capacidade informada para enfrentar inclinações de até 30°. A estrutura de proteção foi projetada para resistir a impactos e quedas de até 1 metro.\n\n**Controle preciso:** controle remoto 2.4 GHz com giroscópio inteligente, que ajuda a corrigir a trajetória, e alcance informado de até 80 metros.\n\n**Bateria recarregável:** bateria de íon-lítio de 500 mAh, com autonomia informada de até 35 minutos de uso contínuo, conforme as condições de utilização.\n\n**Construção:** corpo em ABS e alumínio com revestimento antidesgaste. Produto na cor verde.\n\n**Importante:** confira as orientações do fabricante para carregamento e uso. A autonomia e o alcance podem variar conforme o terreno, a intensidade da brincadeira e as condições da bateria.",
    rating: 4.9,
    reviews: null,
    sold: "800+",
  },

  {
    id: "air-fryer-mondial-afn-40-bft",
    title: "Fritadeira sem Óleo Air Fryer Mondial 4L 1500W AFN-40-BFT",
    cardTitle: "Fritadeira Air Fryer Mondial 4L 1500W",
    checkoutTitle: "Fritadeira sem Óleo Air Fryer Mondial AFN-40-BFT 4L 1500W",
    category: "Eletroportáteis · Cozinha · Casa & Utilidades · Mais vendidos · Recomendados",
    price: 8960,
    original: 24980,
    shippingOriginal: 2620,
    image: "/products/air-fryer-mondial-afn-40-bft/gallery/airfryer-afn40-capa.png",
    gallery: [
      "/products/air-fryer-mondial-afn-40-bft/gallery/airfryer-afn40-1.png",
      "/products/air-fryer-mondial-afn-40-bft/gallery/airfryer-afn40-2.png",
      "/products/air-fryer-mondial-afn-40-bft/gallery/airfryer-afn40-3.png",
      "/products/air-fryer-mondial-afn-40-bft/gallery/airfryer-afn40-4.png",
      "/products/air-fryer-mondial-afn-40-bft/gallery/airfryer-afn40-5.png",
      "/products/air-fryer-mondial-afn-40-bft/gallery/airfryer-afn40-6.png",
      "/products/air-fryer-mondial-afn-40-bft/gallery/airfryer-afn40-7.png"
    ],
    variants: [
      { id: "mondial-afn40-127v", line: "Voltagem", color: "127V", description: "Air Fryer Mondial AFN-40-BFT · 4L · 1500W · 127V", price: 8960, original: 24980, pieces: 1, image: "/products/air-fryer-mondial-afn-40-bft/variants/airfryer-afn40-capa.png" },
      { id: "mondial-afn40-220v", line: "Voltagem", color: "220V", description: "Air Fryer Mondial AFN-40-BFT · 4L · 1500W · 220V", price: 8960, original: 24980, pieces: 1, image: "/products/air-fryer-mondial-afn-40-bft/variants/airfryer-afn40-capa.png" },
    ],
    description: "Prepare receitas com mais praticidade usando a Air Fryer Mondial AFN-40-BFT. Com capacidade de 4 litros e potência de 1.500 W, ela utiliza circulação de ar quente para preparar os alimentos de maneira rápida, sem precisar adicionar óleo ou manteiga.\n\n**Cesto quadrado de 4L:** oferece ampla área plana para acomodar melhor os alimentos e favorecer um preparo uniforme. O revestimento antiaderente Duraflon ajuda a evitar que os alimentos grudem e facilita a limpeza.\n\n**Temperatura e timer ajustáveis:** escolha a temperatura ideal para cada receita, com ajuste de até 200 °C, e programe o timer de até 60 minutos. Ao final do tempo, a fritadeira emite um aviso sonoro e desliga automaticamente.\n\n**Compacta e fácil de limpar:** o design ocupa pouco espaço na bancada. A cuba e o cesto são removíveis, facilitando a higienização após o uso.\n\n**Especificações principais:** capacidade de 4 litros · potência de 1.500 W · cesto quadrado com antiaderente Duraflon · temperatura ajustável até 200 °C · timer de até 60 minutos · aviso sonoro · desligamento automático.\n\n**Atenção:** disponível exclusivamente nas versões 127V e 220V. Não é bivolt. Confira a voltagem da sua residência e selecione a opção correta antes de finalizar a compra.",
    rating: 4.9,
    reviews: null,
    sold: "5.000+",
  },

  {
    id: "hot-wheels-kit-10-mattel-164",
    title: "Kit com 10 Carrinhos Hot Wheels Mattel 2026 · Escala 1:64 · Modelos Sortidos",
    cardTitle: "Kit 10 Carrinhos Hot Wheels Mattel 1:64",
    checkoutTitle: "Kit com 10 Carrinhos Hot Wheels Mattel 2026 · Modelos Sortidos",
    category: "Brinquedos · Infantil · Colecionáveis · Presentes · Recomendados · Natal · 25.12",
    price: 6845,
    original: 23077,
    shippingOriginal: 2620,
    image: "/products/hot-wheels-kit-10-mattel-164/gallery/hotwheels-carrossel-1.png",
    gallery: [
      "/products/hot-wheels-kit-10-mattel-164/gallery/hotwheels-carrossel-1.png",
      "/products/hot-wheels-kit-10-mattel-164/gallery/hotwheels-carrossel-2.png",
      "/products/hot-wheels-kit-10-mattel-164/gallery/hotwheels-carrossel-3.png",
      "/products/hot-wheels-kit-10-mattel-164/gallery/hotwheels-carrossel-4.png",
      "/products/hot-wheels-kit-10-mattel-164/gallery/hotwheels-carrossel-5.png",
      "/products/hot-wheels-kit-10-mattel-164/gallery/hotwheels-carrossel-6.png",
      "/products/hot-wheels-kit-10-mattel-164/gallery/hotwheels-carrossel-7.png",
      "/products/hot-wheels-kit-10-mattel-164/gallery/hotwheels-carrossel-8.png"
    ],
    variants: [],
    description: "Aumente a coleção ou presenteie alguém especial com este kit de 10 carrinhos Hot Wheels originais Mattel, edição 2026, em escala 1:64. As miniaturas têm visual detalhado e são ótimas para brincar, colecionar e montar pistas.\n\n**Kit com 10 modelos sortidos:** os carrinhos são enviados em modelos variados, sem repetição dentro do kit. A seleção é aleatória, conforme a disponibilidade; não é possível escolher modelos específicos.\n\n**Detalhes:** miniaturas Hot Wheels 2026 · escala 1:64 · estrutura die-cast · rodas livres · modelos variados.\n\n**Para brincar e colecionar:** indicado para crianças, fãs de automobilismo e colecionadores de miniaturas. Também é uma opção divertida para presentear.\n\n**Importante:** por se tratar de um kit sortido, os modelos recebidos podem ser diferentes dos exibidos nas imagens. Não é possível selecionar cores, carros ou modelos específicos.",
    rating: 5.0,
    reviews: null,
    sold: "2.500+",
  },

  {
    id: "conjunto-panelas-antiaderente-10-pecas",
    title: "Conjunto de Panelas Antiaderente 10 Peças · 5 Camadas · Várias Cores",
    cardTitle: "Jogo de Panelas Antiaderente 10 Peças",
    checkoutTitle: "Conjunto de Panelas Antiaderente 10 Peças · Escolha a Cor",
    category: "Cozinha · Panelas · Casa & Utilidades · Mais vendidos · Recomendados",
    price: 14975,
    original: 29980,
    shippingOriginal: 2620,
    image: "/products/conjunto-panelas-antiaderente-10-pecas/gallery/panelas-carrossel-1.png",
    gallery: [
      "/products/conjunto-panelas-antiaderente-10-pecas/gallery/panelas-carrossel-1.png",
      "/products/conjunto-panelas-antiaderente-10-pecas/gallery/panelas-carrossel-2.png",
      "/products/conjunto-panelas-antiaderente-10-pecas/gallery/panelas-carrossel-3.png",
      "/products/conjunto-panelas-antiaderente-10-pecas/gallery/panelas-carrossel-4.png",
      "/products/conjunto-panelas-antiaderente-10-pecas/gallery/panelas-carrossel-5.png"
    ],
    variants: [
      { id: "panelas-cor-cereja", line: "Cor", color: "Cereja", description: "Conjunto de Panelas Antiaderente 10 Peças · Cereja", price: 14975, original: 29980, pieces: 1, image: "/products/conjunto-panelas-antiaderente-10-pecas/variants/panelas-cereja.png" },
      { id: "panelas-cor-preto", line: "Cor", color: "Preto", description: "Conjunto de Panelas Antiaderente 10 Peças · Preto", price: 14975, original: 29980, pieces: 1, image: "/products/conjunto-panelas-antiaderente-10-pecas/variants/panelas-preto.png" },
      { id: "panelas-cor-preto-bege", line: "Cor", color: "Preto com Bege", description: "Conjunto de Panelas Antiaderente 10 Peças · Preto com Bege", price: 14975, original: 29980, pieces: 1, image: "/products/conjunto-panelas-antiaderente-10-pecas/variants/panelas-preto-com-bege.png" }
    ],
    description: "Renove sua cozinha com um conjunto de 10 peças pensado para deixar o preparo das refeições mais prático. As panelas são feitas em alumínio com 1,2 mm de espessura e revestimento antiaderente de 5 camadas, que ajuda a evitar que os alimentos grudem e facilita a limpeza.\n\n**Mais praticidade no dia a dia:** tampas de vidro temperado com saída de vapor permitem acompanhar o preparo. Os cabos e pegadores em baquelite antitérmico oferecem manuseio mais confortável, enquanto os 3 acessórios de nylon ajudam a preservar o revestimento.\n\n**Conteúdo do conjunto:** 2 panelas, 2 caçarolas, 2 frigideiras fundas, 1 fervedor e 3 acessórios de nylon sortidos. Os acessórios podem variar conforme a disponibilidade.\n\n**Capacidades e medidas:** panela de 2 L (18 cm) e panela de 1,5 L (16 cm); caçarola de 2,7 L (20 cm) e caçarola de 2 L (18 cm); frigideira funda de 1,6 L (20 cm) e frigideira funda de 1,4 L (18 cm); fervedor de 2 L (14 cm). Alturas entre 6 e 12 cm, conforme a peça.\n\n**Material e compatibilidade:** alumínio com 1,2 mm de espessura, revestimento antiaderente de 5 camadas, tampas de vidro temperado e cabos/pegadores de baquelite. Compatível com fogão a gás.\n\n**Escolha sua cor:** Cereja, Preto ou Preto com Bege. Confira a opção selecionada antes de concluir a compra.",
    rating: 4.9,
    reviews: null,
    sold: "3.000+",
  },


  {
    id: "kit-24-bolas-natalinas-5cm",
    title: "Kit com 24 Bolinhas de Natal 5 cm · Dourado e Vermelho",
    cardTitle: "Kit 24 Bolinhas de Natal 5 cm",
    checkoutTitle: "Kit com 24 Bolinhas Natalinas de 5 cm · Escolha a Cor",
    category: "Natal · Decoração · Enfeites Natalinos · Presentes",
    price: 2995,
    original: 5980,
    shippingOriginal: 2620,
    image: "/products/kit-24-bolas-natalinas-5cm/gallery/bolas-natalinas-carrossel-1.png",
    gallery: [
      "/products/kit-24-bolas-natalinas-5cm/gallery/bolas-natalinas-carrossel-1.png",
      "/products/kit-24-bolas-natalinas-5cm/gallery/bolas-natalinas-carrossel-2.png",
      "/products/kit-24-bolas-natalinas-5cm/gallery/bolas-natalinas-carrossel-3.png",
      "/products/kit-24-bolas-natalinas-5cm/gallery/bolas-natalinas-carrossel-4.png",
      "/products/kit-24-bolas-natalinas-5cm/gallery/bolas-natalinas-carrossel-5.png"
    ],
    variants: [
      { id: "bolas-natalinas-dourado", line: "Cor", color: "Dourado", description: "Kit com 24 Bolinhas Natalinas de 5 cm · Dourado", price: 2995, original: 5980, pieces: 1, image: "/products/kit-24-bolas-natalinas-5cm/variants/bolas-natalinas-dourado.png" },
      { id: "bolas-natalinas-vermelho", line: "Cor", color: "Vermelho", description: "Kit com 24 Bolinhas Natalinas de 5 cm · Vermelho", price: 2995, original: 5980, pieces: 1, image: "/products/kit-24-bolas-natalinas-5cm/variants/bolas-natalinas-vermelho.png" }
    ],
    description: "Deixe a decoração de Natal ainda mais bonita com este kit de 24 bolinhas natalinas de 5 cm. Com três acabamentos — brilhante, glitter e fosco —, os enfeites ajudam a criar uma árvore harmoniosa, com diferentes pontos de luz e textura.\n\n**Três acabamentos no mesmo kit:** combinação de bolinhas brilhantes, com glitter e foscas para dar mais movimento e profundidade à decoração.\n\n**Leves e fáceis de pendurar:** distribua os enfeites pela árvore e combine com laços, luzes, festões, flores e outros acessórios natalinos.\n\n**Ficha técnica:** 24 unidades · diâmetro de 5 cm · acabamento brilhante, glitter e fosco · indicado para decoração natalina e árvores de diferentes tamanhos.\n\n**Escolha a cor:** Dourado ou Vermelho. O kit é reutilizável e pode ser guardado após as festas para decorar nos próximos Natais.",
    rating: 5.0,
    reviews: null,
    sold: "350+",
  },


  {
    id: "jbl-boombox-4",
    title: "Caixa de Som Bluetooth Portátil JBL Boombox 4 · 210 W RMS · IP68",
    cardTitle: "JBL Boombox 4 Bluetooth 210W",
    checkoutTitle: "Caixa de Som JBL Boombox 4 Bluetooth · Preta",
    category: "Eletrônicos · Áudio · Caixas de Som · Recomendados · Natal · 25.12 · Presentes",
    price: 21840,
    original: 218405,
    shippingOriginal: 2620,
    image: "/products/jbl-boombox-4/gallery/jbl-boombox-4-carrossel-1.png",
    variants: [],
    gallery: [
      "/products/jbl-boombox-4/gallery/jbl-boombox-4-carrossel-1.png",
      "/products/jbl-boombox-4/gallery/jbl-boombox-4-carrossel-2.png",
      "/products/jbl-boombox-4/gallery/jbl-boombox-4-carrossel-3.png",
      "/products/jbl-boombox-4/gallery/jbl-boombox-4-carrossel-4.png",
      "/products/jbl-boombox-4/gallery/jbl-boombox-4-carrossel-5.png"
    ],
    description: "A JBL Boombox 4 é uma caixa de som Bluetooth portátil desenvolvida para entregar potência, graves profundos e resistência em diferentes ambientes. O sistema de áudio redesenhado combina dois woofers maiores, dois tweeters e três radiadores passivos para proporcionar JBL Pro Sound com maior impacto e clareza.\n\nA tecnologia AI Sound Boost analisa a música em tempo real e ajusta o áudio para oferecer mais potência com menos distorção, mesmo quando o volume está elevado. Para personalizar ainda mais a experiência, o Bass Boost oferece dois níveis de graves: Deep Bass, para uma resposta mais profunda, e Punchy Bass, para um som mais potente e energético.\n\nA bateria proporciona até 28 horas de reprodução com uma única carga, com mais 6 horas por meio do Playtime Boost, totalizando até 34 horas de reprodução. O produto também conta com bateria substituível, vendida separadamente, permitindo prolongar a vida útil da caixa.\n\nCom classificação IP68, a Boombox 4 é resistente à água e à poeira, podendo acompanhar diferentes ambientes externos. O design foi repensado para ficar maior, mais potente e 0,8 kg mais leve que a geração anterior, facilitando o transporte.\n\nA conectividade Auracast™ permite emparelhar duas Boombox 4 para uma experiência estéreo ou conectar múltiplas caixas JBL compatíveis para ampliar o alcance do som. Pela porta USB-C, a caixa também reproduz áudio lossless quando utilizada com fonte e conteúdo compatíveis.\n\nO app JBL Portable permite acessar atualizações, suporte e controles de áudio personalizáveis. A combinação de potência de até 210 W RMS, AI Sound Boost, Bass Boost, IP68, Auracast™ e reprodução lossless faz da JBL Boombox 4 uma caixa completa para festas, encontros e momentos ao ar livre.\n\n**Especificações principais:** potência informada de até 210 W RMS · Bluetooth · AI Sound Boost · Bass Boost com modos Deep Bass e Punchy Bass · até 28 horas de reprodução, mais até 6 horas com Playtime Boost · proteção IP68 contra água e poeira · conexão Auracast™ · USB-C com reprodução lossless em condições compatíveis · compatibilidade com o app JBL Portable.\n\n**Cor disponível:** Preto.\n\n**Importante:** a bateria substituível é vendida separadamente. A autonomia pode variar conforme o volume, o conteúdo reproduzido e as condições de uso. A reprodução lossless pela USB-C depende de fonte e conteúdo compatíveis.",
    rating: 5.0,
    reviews: null,
    sold: "3.800+",
  },

  {
    id: "smartwatch-t900-s10-ultra-pro",
    title: "Relógio Inteligente Smartwatch T900 S10 Ultra Pro · 49 mm · 3 Pulseiras",
    cardTitle: "Smartwatch T900 S10 Ultra Pro",
    checkoutTitle: "Smartwatch T900 S10 Ultra Pro · 3 Pulseiras",
    category: "Eletrônicos · Acessórios para Celular · Smartwatches · Presentes · Natal · 25.12",
    price: 3840,
    original: 13985,
    shippingOriginal: 0,
    image: "/products/smartwatch-t900-s10-ultra-pro/gallery/smartwatch-t900-s10-ultra-pro-1.png",
    variants: [],
    gallery: [
      "/products/smartwatch-t900-s10-ultra-pro/gallery/smartwatch-t900-s10-ultra-pro-1.png",
      "/products/smartwatch-t900-s10-ultra-pro/gallery/smartwatch-t900-s10-ultra-pro-2.png",
      "/products/smartwatch-t900-s10-ultra-pro/gallery/smartwatch-t900-s10-ultra-pro-3.png",
      "/products/smartwatch-t900-s10-ultra-pro/gallery/smartwatch-t900-s10-ultra-pro-4.png",
      "/products/smartwatch-t900-s10-ultra-pro/gallery/smartwatch-t900-s10-ultra-pro-5.png",
      "/products/smartwatch-t900-s10-ultra-pro/gallery/smartwatch-t900-s10-ultra-pro-6.png",
      "/products/smartwatch-t900-s10-ultra-pro/gallery/smartwatch-t900-s10-ultra-pro-7.png"
    ],
    description: "O Relógio Inteligente Smartwatch T900 S10 Ultra Pro foi pensado para quem quer acompanhar a rotina com mais praticidade no pulso. Com visual esportivo e caixa de 49 mm, ele reúne funções úteis para o dia a dia, treinos e acompanhamento de notificações em um único acessório.\n\nA tela LCD de 49 mm oferece leitura ampla das informações, ajudando na visualização de dados, alertas e recursos rápidos. A estrutura na cor Galaxy, com aro preto em DLC e pulseira esportiva de silicone, traz um aspecto moderno e discreto para diferentes momentos de uso.\n\n**O produto acompanha três pulseiras incluídas: uma laranja, uma preta e uma branca.** Assim, você pode alternar o visual do relógio de acordo com sua preferência, sem precisar comprar as pulseiras separadamente.\n\nEntre os recursos informados para o modelo, estão chamadas via Bluetooth, notificações, bússola, cronômetro, calculadora, temporizador e armazenamento de música. Também são informados Wi-Fi, GPS, NFC e conectividade móvel, recursos cuja disponibilidade pode depender da compatibilidade do aparelho e da configuração utilizada.\n\nPara acompanhar a rotina ativa, o modelo traz resistência à água de até 1 m e bateria de 450 mAh, com autonomia informada de até 30 horas. A memória interna de 1 GB e a RAM de 256 MB contribuem para uma experiência funcional nas tarefas do relógio.\n\n**Especificações informadas:** caixa de 49 mm · tela LCD · aro preto em DLC · estrutura Galaxy · três pulseiras de silicone (laranja, preta e branca) · bateria de 450 mAh · autonomia anunciada de até 30 horas · memória interna de 1 GB · RAM de 256 MB · chamadas Bluetooth · Wi-Fi · GPS · NFC · bússola · cronômetro · calculadora · temporizador e armazenamento de música.\n\n**Conteúdo incluído:** 1 Smartwatch T900 S10 Ultra Pro e 3 pulseiras (laranja, preta e branca).\n\nA autonomia e o funcionamento dos recursos podem variar conforme o uso, o smartphone conectado e a compatibilidade de cada função. A resistência à água informada é de até 1 metro; evite utilizar o relógio em condições além das especificadas pelo fabricante.",
    rating: 4.9,
    reviews: null,
    sold: "1.000+",
  },

  {
    id: "omo-lavanderia-profissional-7l",
    title: "Lava Roupas Líquido OMO Lavanderia Profissional 7 L",
    cardTitle: "OMO Lavanderia Profissional 7 L",
    checkoutTitle: "Lava Roupas Líquido OMO Lavanderia Profissional 7 L",
    category: "Casa & Utilidades · Limpeza · Lavanderia · Mais vendidos · Recomendados",
    price: 4385,
    original: 9238,
    shippingOriginal: 0,
    image: "/products/omo-lavanderia-profissional-7l/gallery/omo-lavanderia-profissional-7l-1.png",
    variants: [],
    gallery: [
      "/products/omo-lavanderia-profissional-7l/gallery/omo-lavanderia-profissional-7l-1.png",
      "/products/omo-lavanderia-profissional-7l/gallery/omo-lavanderia-profissional-7l-2.png",
      "/products/omo-lavanderia-profissional-7l/gallery/omo-lavanderia-profissional-7l-3.png",
      "/products/omo-lavanderia-profissional-7l/gallery/omo-lavanderia-profissional-7l-4.png",
      "/products/omo-lavanderia-profissional-7l/gallery/omo-lavanderia-profissional-7l-5.png",
      "/products/omo-lavanderia-profissional-7l/gallery/omo-lavanderia-profissional-7l-6.png",
      "/products/omo-lavanderia-profissional-7l/gallery/omo-lavanderia-profissional-7l-7.png"
    ],
    description: "O Lava Roupas Líquido OMO Lavanderia Profissional 7 L foi desenvolvido para atender rotinas de lavagem com alta demanda, como lavanderias comerciais, oferecendo rendimento e poder de limpeza em um galão de 7 litros.\n\nSua fórmula de espuma de alta performance ajuda a remover manchas desde a primeira lavagem e foi pensada para cuidar de diferentes tipos de peças, das roupas delicadas às mais pesadas. De acordo com as informações do fabricante, o produto rende até 500 kg de roupas limpas ou aproximadamente 100 lavagens, conforme a dosagem recomendada.\n\nO rendimento pode variar de acordo com a quantidade de produto utilizada, o nível de sujeira e a capacidade da máquina. A referência de até 100 lavagens considera uma máquina com capacidade para 11 kg e roupas com sujeira moderada, seguindo as orientações de uso da embalagem.\n\n**Conteúdo da embalagem:** 1 galão de OMO Lavanderia Profissional com 7 litros.\n\n**Destaques:** embalagem econômica de 7 L · indicado para rotinas de lavagem de alta demanda · espuma de alta performance · ajuda a remover manchas na primeira lavagem · cuidado para roupas delicadas e pesadas · rendimento anunciado de até 500 kg de roupas ou 100 lavagens, conforme dosagem e condições de uso.\n\nPara melhores resultados, siga sempre as instruções de dosagem e uso descritas no rótulo do produto.",
    rating: 5.0,
    reviews: null,
    sold: "8.000+",
  },

  {
    id: "controle-sem-fio-xbox-branco",
    title: "Controle Sem Fio Xbox Series X|S, Xbox One e PC Bluetooth Branco",
    cardTitle: "Controle Xbox Sem Fio Branco",
    checkoutTitle: "Controle Sem Fio Xbox Branco Bluetooth",
    category: "Games · Acessórios Gamer · Eletrônicos · Presentes · Recomendados · Natal · 25.12",
    price: 10783,
    original: 46580,
    shippingOriginal: 0,
    image: "/products/controle-sem-fio-xbox-branco/gallery/controle-xbox-branco-1.png",
    variants: [],
    gallery: [
      "/products/controle-sem-fio-xbox-branco/gallery/controle-xbox-branco-1.png",
      "/products/controle-sem-fio-xbox-branco/gallery/controle-xbox-branco-2.png",
      "/products/controle-sem-fio-xbox-branco/gallery/controle-xbox-branco-3.png",
      "/products/controle-sem-fio-xbox-branco/gallery/controle-xbox-branco-4.png",
      "/products/controle-sem-fio-xbox-branco/gallery/controle-xbox-branco-5.png",
      "/products/controle-sem-fio-xbox-branco/gallery/controle-xbox-branco-6.png"
    ],
    description: "Tenha mais liberdade para jogar com o Controle Sem Fio Xbox Branco. Com design ergonômico, formato confortável e conexão Bluetooth, ele permite jogar sem deixar cabos atrapalhando a sua experiência.\n\nA conexão sem fio oferece praticidade para utilizar o controle em dispositivos compatíveis, incluindo computadores com Bluetooth. O sinal estável e a tecnologia anti-interferência ajudam a manter a conexão durante as partidas, sem depender de aplicativos de terceiros.\n\nO controle conta com sistema de vibração incorporado para deixar os jogos mais imersivos. Também acompanha cabo de 1 metro, oferecendo uma alternativa de conexão ou alimentação conforme a compatibilidade do dispositivo.\n\n**Informações do produto**\n- Quantidade: 1 controle\n- Cor: branco\n- Conectividade: Bluetooth e sem fio\n- Compatibilidade informada: Xbox Series X|S, Xbox One e PC; confirme a compatibilidade do dispositivo e do sistema antes da compra\n- Vibração incorporada\n- Cabo incluso com 1 metro de comprimento\n- Design ergonômico para maior conforto durante as partidas\n\n**Conteúdo da embalagem:** 1 controle sem fio branco e 1 cabo de 1 metro.",
    rating: 5.0,
    reviews: null,
    sold: "800+",
  },

  {
    id: "ventilador-mondial-super-turbo-8-pas-40cm",
    title: "Ventilador Super Turbo Mondial 8 Pás 40 cm",
    cardTitle: "Ventilador Mondial Super Turbo 40 cm",
    checkoutTitle: "Ventilador Super Turbo Mondial 8 Pás 40 cm",
    category: "Climatização · Eletroportáteis · Casa & Utilidades · Mais vendidos",
    price: 6985,
    original: 24490,
    shippingOriginal: 0,
    image: "/products/ventilador-mondial-super-turbo-8-pas-40cm/gallery/ventilador-mondial-1.png",
    variants: [
      { id: "ventilador-mondial-127v", line: "Tensão", color: "127V", description: "Ventilador Mondial Super Turbo 40 cm · 127 V", price: 6985, original: 24490, pieces: 1, image: "/products/ventilador-mondial-super-turbo-8-pas-40cm/gallery/ventilador-mondial-1.png" },
      { id: "ventilador-mondial-220v", line: "Tensão", color: "220V", description: "Ventilador Mondial Super Turbo 40 cm · 220 V", price: 6985, original: 24490, pieces: 1, image: "/products/ventilador-mondial-super-turbo-8-pas-40cm/gallery/ventilador-mondial-1.png" },
    ],
    gallery: [
      "/products/ventilador-mondial-super-turbo-8-pas-40cm/gallery/ventilador-mondial-1.png",
      "/products/ventilador-mondial-super-turbo-8-pas-40cm/gallery/ventilador-mondial-2.png",
      "/products/ventilador-mondial-super-turbo-8-pas-40cm/gallery/ventilador-mondial-3.png",
      "/products/ventilador-mondial-super-turbo-8-pas-40cm/gallery/ventilador-mondial-4.png",
      "/products/ventilador-mondial-super-turbo-8-pas-40cm/gallery/ventilador-mondial-5.png",
      "/products/ventilador-mondial-super-turbo-8-pas-40cm/gallery/ventilador-mondial-6.png"
    ],
    description: "O Ventilador Super Turbo Mondial de 40 cm com 8 pás foi desenvolvido para oferecer ventilação intensa e melhor distribuição do ar, ajudando a deixar os ambientes mais frescos e agradáveis. Seu design aerodinâmico combina uma hélice de alta performance com funcionamento pensado para proporcionar mais conforto no dia a dia.\n\nO sistema oscilante horizontal amplia o alcance do vento pelo ambiente. Se preferir direcionar o fluxo para um ponto específico, basta fixar a oscilação. A inclinação vertical regulável permite ajustar a direção do ar conforme a necessidade.\n\nO ventilador oferece três velocidades — mínima, média e máxima — para adequar a ventilação a diferentes momentos, desde uma brisa mais suave até um fluxo de ar mais intenso. Seu sistema de ventilação foi projetado para funcionar com mais silêncio e conforto.\n\nA limpeza também é prática: as grades frontal e traseira e a hélice são removíveis, facilitando a retirada de poeira. A alça traseira ajuda no transporte entre os cômodos, enquanto o porta-fio embutido permite guardar o cabo após o uso.\n\n**Características**\n- Marca: Mondial\n- Linha: Super Turbo\n- Diâmetro: 40 cm\n- Hélice com 8 pás\n- 3 velocidades: mínima, média e máxima\n- Oscilação horizontal com opção de direcionamento fixo\n- Inclinação vertical regulável\n- Grades e hélice removíveis para facilitar a limpeza\n- Alça para transporte e porta-fio embutido\n- Opções de tensão: 127 V ou 220 V — selecione a voltagem compatível com a instalação do local de uso\n\n**Conteúdo da embalagem:** 1 ventilador Mondial Super Turbo 40 cm com 8 pás.",
    rating: 5.0,
    reviews: null,
    sold: "500+",
  },

  {
    id: "power-bank-basike-10000mah-preto",
    title: "Power Bank Basike 10.000 mAh 22,5 W Preto",
    cardTitle: "Power Bank Basike 10.000 mAh",
    checkoutTitle: "Power Bank Basike 10.000 mAh Preto",
    category: "Eletrônicos · Acessórios para Celular · Power Banks · Recomendados · Natal · 25.12 · Presentes",
    price: 2798,
    original: 8985,
    shippingOriginal: 0,
    image: "/products/power-bank-basike-10000mah-preto/gallery/powerbank-basike-1.png",
    variants: [],
    gallery: [
      "/products/power-bank-basike-10000mah-preto/gallery/powerbank-basike-1.png",
      "/products/power-bank-basike-10000mah-preto/gallery/powerbank-basike-2.png",
      "/products/power-bank-basike-10000mah-preto/gallery/powerbank-basike-3.png",
      "/products/power-bank-basike-10000mah-preto/gallery/powerbank-basike-4.png",
      "/products/power-bank-basike-10000mah-preto/gallery/powerbank-basike-5.png",
      "/products/power-bank-basike-10000mah-preto/gallery/powerbank-basike-6.png"
    ],
    description: "O Power Bank Basike 10.000 mAh é uma bateria portátil compacta, ideal para manter seus dispositivos carregados durante passeios, viagens, deslocamentos e a rotina do dia a dia. Com potência máxima de até 22,5 W e conexões USB-C e USB-A, oferece opções práticas para recarregar aparelhos compatíveis.\n\nO modelo POW078 possui bateria de 10.000 mAh (37 Wh), corpo em ABS e plástico resistente e acabamento preto. Seu formato compacto mede aproximadamente 15 × 7 × 1,5 cm e pesa cerca de 250 g, facilitando o transporte na bolsa ou mochila.\n\nA entrada USB-C aceita recarga de até 20 W. Nas saídas, o aparelho oferece USB-C de até 20 W, USB-A de até 22,5 W, cabo integrado USB-C de até 22,5 W e cabo Lightning de até 10 W, conforme os perfis de tensão e corrente indicados pelo fornecedor. A recarga completa é informada em aproximadamente 3 horas usando carregador USB-C de 20 W compatível.\n\n**Especificações**\n- Marca: Basike\n- Modelo: POW078\n- Cor deste anúncio: preto\n- Capacidade da bateria: 10.000 mAh (37 Wh)\n- Potência máxima de saída: até 22,5 W\n- Entrada USB-C: 5 V⎓3 A, 9 V⎓2 A ou 12 V⎓1,5 A (até 20 W)\n- Saída USB-C: até 20 W\n- Saída USB-A: até 22,5 W\n- Cabo USB-C integrado: até 22,5 W\n- Cabo Lightning integrado: até 10 W\n- Tempo de recarga informado: aproximadamente 3 horas com carregador USB-C de 20 W\n- Dimensões: aproximadamente 15 × 7 × 1,5 cm\n- Peso: aproximadamente 250 g\n- Material: ABS e plástico resistente\n\n**Conteúdo da embalagem:** 1 power bank, 1 cabo USB-C e 1 manual de segurança. A velocidade de carregamento e a compatibilidade dependem do aparelho, do cabo e da fonte utilizados.",
    rating: 4.9,
    reviews: null,
    sold: "1.000+",
  },

  {
    id: "espumante-chandon-reserve-brut-750ml",
    title: "Espumante Branco Brut Réserve Chandon 750 ml",
    cardTitle: "Chandon Réserve Brut 750 ml",
    checkoutTitle: "Espumante Chandon Réserve Brut 750 ml",
    category: "Bebidas · Espumantes · Vinhos · Presentes · Natal · 25.12",
    price: 4970,
    original: 12490,
    shippingOriginal: 0,
    image: "/products/espumante-chandon-reserve-brut-750ml/gallery/chandon-1.png",
    variants: [],
    gallery: [
      "/products/espumante-chandon-reserve-brut-750ml/gallery/chandon-1.png",
      "/products/espumante-chandon-reserve-brut-750ml/gallery/chandon-2.png",
      "/products/espumante-chandon-reserve-brut-750ml/gallery/chandon-3.png",
      "/products/espumante-chandon-reserve-brut-750ml/gallery/chandon-4.png"
    ],
    description: "O Chandon Réserve Brut é um espumante brasileiro elaborado na Serra Gaúcha a partir de um assemblage das uvas Chardonnay, Pinot Noir e Riesling Itálico. Apresenta coloração amarelo-dourada, espuma abundante e persistente e borbulhas finas e numerosas.\n\nNo aroma, revela sutilezas de frutas cítricas, maçã verde e frutas secas. No paladar, é leve, fresco e equilibrado, ideal para acompanhar ocasiões especiais e refeições.\n\n**Harmonização:** ostras, sushis, saladas e carnes brancas.\n\n**Informações**\n- Produtor: Casa Chandon\n- País: Brasil\n- Região: Garibaldi, Serra Gaúcha\n- Tipo: Espumante Brut\n- Uvas: Chardonnay, Pinot Noir e Riesling Itálico\n- Volume: 750 ml\n- Graduação alcoólica: 11,8%\n\n**Aviso legal:** venda e consumo proibidos para menores de 18 anos. Beba com moderação.",
    rating: 5.0,
    reviews: null,
    sold: "300+",
  },
  {
    id: "purificador-electrolux-pa26g",
    title: "Purificador de Água Electrolux PA26G Prata · Bivolt",
    cardTitle: "Purificador Electrolux PA26G Bivolt",
    checkoutTitle: "Purificador de Água Electrolux PA26G Prata Bivolt",
    category: "Casa & Utilidades · Cozinha · Eletroportáteis · Recomendados",
    price: 11785, original: 87391, shippingOriginal: 0,
    image: "/products/purificador-electrolux-pa26g/gallery/bebedouro-eletrolux-carrossel-1.webp",
    gallery: ["/products/purificador-electrolux-pa26g/gallery/bebedouro-eletrolux-carrossel-1.webp", "/products/purificador-electrolux-pa26g/gallery/bebedouro-eletrolux-carrossel-2.webp", "/products/purificador-electrolux-pa26g/gallery/bebedouro-eletrolux-carrossel-3.webp", "/products/purificador-electrolux-pa26g/gallery/bebedouro-eletrolux-carrossel-4.webp", "/products/purificador-electrolux-pa26g/gallery/bebedouro-eletrolux-carrossel-5.webp", "/products/purificador-electrolux-pa26g/gallery/bebedouro-eletrolux-carrossel-6.webp", "/products/purificador-electrolux-pa26g/gallery/bebedouro-eletrolux-carrossel-7.webp", "/products/purificador-electrolux-pa26g/gallery/bebedouro-eletrolux-carrossel-8.webp"],
    variants: [],
    description: "O Purificador de Água Electrolux PA26G combina design moderno, praticidade e filtragem eficiente para acompanhar a rotina da família. Com acabamento prata e painel Blue Touch sensível ao toque, permite selecionar a quantidade de água e escolher entre as opções natural e gelada, além de oferecer fluxo contínuo ou controlado.\n\nSeu sistema Acqua Clean conta com dois estágios de purificação, incluindo carvão ativado e ultrafiltragem (UF), ajudando a reduzir impurezas, cloro e odores. O filtro possui longa duração e o aparelho emite um alerta luminoso quando chega o momento da troca.\n\nA refrigeração eletrônica disponibiliza água gelada com praticidade. A bandeja flexível e removível facilita o uso com diferentes recipientes e a limpeza. O modelo é bivolt, portanto não exige seleção de voltagem na compra.\n\n**Especificações:** cor prata · bivolt · refrigeração eletrônica · água natural e gelada · 2 estágios de purificação (carvão ativado e ultrafiltragem UF) · painel Blue Touch · controle de porções · fluxo contínuo ou controlado · alerta de troca do filtro · bandeja removível · suportes para parede · pés antiderrapantes.\n\n**Atenção à instalação:** a pressão da água deve estar entre 4 e 40 mca, respeitando o mínimo recomendado de 4 mca. Verifique as condições hidráulicas do local antes da instalação.",
    rating: 4.9, reviews: null, sold: "150+",
  },
  {
    id: "jogo-facas-tramontina-plenus-9-pecas",
    title: "Jogo de Facas Plenus Tramontina · 9 Peças · Aço Inox",
    cardTitle: "Jogo de Facas Tramontina Plenus · 9 Peças",
    checkoutTitle: "Jogo de Facas Plenus Tramontina 9 Peças em Aço Inox",
    category: "Casa & Utilidades · Cozinha · Utensílios de Cozinha · Recomendados",
    price: 5835,
    original: 9290,
    shippingOriginal: 0,
    image: "/products/jogo-facas-tramontina-plenus/gallery/facas-tramontina-1.png",
    gallery: [
      "/products/jogo-facas-tramontina-plenus/gallery/facas-tramontina-1.png",
      "/products/jogo-facas-tramontina-plenus/gallery/facas-tramontina-3.png",
      "/products/jogo-facas-tramontina-plenus/gallery/facas-tramontina-4.png"
    ],
    variants: [],
    description: "O Jogo de Facas Plenus Tramontina com 9 peças reúne opções versáteis para facilitar o preparo das refeições e os diferentes cortes do dia a dia. Com visual clássico e cabos pretos, o conjunto combina com diversos estilos de cozinha e também é uma ótima escolha para churrascos e encontros com a família e os amigos.\n\nAs lâminas são produzidas em aço inox e recebem tratamento térmico, característica que contribui para a resistência e a qualidade do corte. Os cabos em polipropileno oferecem uma pegada prática para o uso cotidiano.\n\n**Características do produto**\n- Marca: Tramontina\n- Linha: Plenus\n- Quantidade: 9 peças\n- Lâminas em aço inox com tratamento térmico\n- Cabos em polipropileno na cor preta\n- Conjunto indicado para diferentes tipos de cortes e preparos\n\n**Dimensões e peso do produto na embalagem**\n- Altura: 42,7 cm\n- Largura: 2,2 cm\n- Comprimento: 44,5 cm\n- Peso: 725 g",
    rating: 4.9,
    reviews: null,
    sold: "100",
  },
  {
    id: "camera-intelbras-im5-plus",
    title: "Câmera de Segurança Intelbras iM5+ Full HD Wi-Fi Full Color",
    cardTitle: "Câmera Intelbras iM5+ Full HD Wi-Fi",
    checkoutTitle: "Câmera de Segurança Intelbras iM5+ Full HD Wi-Fi",
    category: "Segurança e Monitoramento · Câmeras de Segurança · Eletrônicos · Casa & Utilidades · Recomendados",
    price: 7983,
    original: 23760,
    shippingOriginal: 0,
    image: "/products/camera-intelbras-im5-plus/gallery/camera-carrossel-1.png",
    gallery: [
      "/products/camera-intelbras-im5-plus/gallery/camera-carrossel-1.png",
      "/products/camera-intelbras-im5-plus/gallery/camera-carrossel-2.png",
      "/products/camera-intelbras-im5-plus/gallery/camera-carrossel-3.png",
      "/products/camera-intelbras-im5-plus/gallery/camera-carrossel-4.png",
      "/products/camera-intelbras-im5-plus/gallery/camera-carrossel-5.png"
    ],
    variants: [],
    description: "A Intelbras iM5+ é uma câmera Wi-Fi Full HD desenvolvida para acompanhar o que acontece dentro e fora de casa, com recursos que ajudam a manter o ambiente sob observação mesmo quando você está longe. A tecnologia Full Color permite visualizar imagens coloridas à noite, enquanto o conjunto de infravermelho inteligente e holofote auxilia na captura de imagens em locais com pouca luz.\n\nPelo smartphone, é possível acompanhar a transmissão, receber notificações e controlar funções da câmera. O áudio bidirecional permite conversar com quem estiver próximo ao equipamento, e a sirene interna de 90 dB pode ser acionada manualmente como recurso adicional de alerta. Também conta com detecção ajustável de movimento e de pessoas, além de zoom digital de até 16x.\n\nProjetada para instalação externa, possui proteção IP67 contra poeira e água. A conexão pode ser feita por Wi-Fi de 2,4 GHz ou cabo de rede RJ45. Para armazenar as gravações, oferece suporte a cartão microSD, gravadores DVR/NVR compatíveis com Onvif e serviço em nuvem Mibo Cloud.\n\n**Características principais**\n- Resolução Full HD: 1920 × 1080 pixels (2 MP)\n- Tecnologia Full Color para imagens coloridas à noite\n- Lente de 2,8 mm e ângulo de visão horizontal de 102°\n- Infravermelho com alcance aproximado de 30 m e holofote de até 25 m\n- Áudio bidirecional e sirene de 90 dB\n- Detecção ajustável de movimento e pessoas\n- Zoom digital de até 16x\n- Wi-Fi 2,4 GHz e conexão cabeada RJ45\n- Compressão de vídeo H.264 e compatibilidade Onvif Perfil S\n- Proteção IP67 para uso externo\n- Alimentação por fonte 12 V inclusa\n- Dimensões: 147,7 × 74,2 × 74,2 mm\n- Temperatura de operação: -30 °C a 60 °C\n\n**Conteúdo da embalagem:** 1 câmera Intelbras iM5+, 1 fonte de alimentação bivolt, 1 kit de instalação e 1 guia de instalação.\n\n**Atenção:** a câmera utiliza rede Wi-Fi de 2,4 GHz. A fonte é bivolt; para instalação, verifique a cobertura da rede no local e siga o guia do fabricante.",
    rating: null,
    reviews: null,
    sold: null,
  },,

  {
    id: "jogo-lencol-casal-400-fios",
    title: "Jogo de Lençol Casal Padrão 400 Fios · 3 Peças",
    cardTitle: "Jogo de Lençol Casal 400 Fios · 3 Peças",
    checkoutTitle: "Jogo de Lençol Casal Padrão 400 Fios com Elástico · 3 Peças",
    category: "Cama, Mesa e Banho · Casa & Utilidades · Mais vendidos · Recomendados",
    price: 2690,
    original: 5190,
    shippingOriginal: 0,
    image: "/products/jogo-lencol-casal-400-fios/gallery/lencol-casal-capa.png",
    gallery: [
      "/products/jogo-lencol-casal-400-fios/gallery/lencol-casal-capa.png",
      "/products/jogo-lencol-casal-400-fios/variants/lencol-bege.png",
      "/products/jogo-lencol-casal-400-fios/variants/lencol-cinza.png",
      "/products/jogo-lencol-casal-400-fios/variants/lencol-rosa.png",
      "/products/jogo-lencol-casal-400-fios/variants/lencol-verde.png"
    ],
    variants: [
      { id: "lencol-casal-bege", line: "Cor", color: "Bege", description: "Jogo de lençol casal padrão 400 fios · Bege · 3 peças", price: 2690, original: 5190, pieces: 1, image: "/products/jogo-lencol-casal-400-fios/variants/lencol-bege.png" },
      { id: "lencol-casal-verde", line: "Cor", color: "Verde", description: "Jogo de lençol casal padrão 400 fios · Verde · 3 peças", price: 2690, original: 5190, pieces: 1, image: "/products/jogo-lencol-casal-400-fios/variants/lencol-verde.png" },
      { id: "lencol-casal-cinza", line: "Cor", color: "Cinza", description: "Jogo de lençol casal padrão 400 fios · Cinza · 3 peças", price: 2690, original: 5190, pieces: 1, image: "/products/jogo-lencol-casal-400-fios/variants/lencol-cinza.png" },
      { id: "lencol-casal-rosa", line: "Cor", color: "Rosa", description: "Jogo de lençol casal padrão 400 fios · Rosa · 3 peças", price: 2690, original: 5190, pieces: 1, image: "/products/jogo-lencol-casal-400-fios/variants/lencol-rosa.png" }
    ],
    description: "Renove a cama com um jogo de lençol casal padrão de visual delicado e toque macio. Confeccionado em micropercal 100% poliéster, com indicação de 400 fios, o conjunto combina praticidade para o dia a dia com um acabamento em ponto palito que acrescenta um detalhe elegante ao enxoval.\n\nO tecido de poliéster é fácil de cuidar, seca com praticidade e oferece boa resistência ao uso frequente. O lençol com elástico em toda a volta ajuda a manter a peça ajustada ao colchão, enquanto as duas fronhas completam a composição.\n\n**O conjunto contém 3 peças**\n- 1 lençol de baixo com elástico em toda a volta\n- 2 fronhas de 50 × 70 cm com acabamento em ponto palito\n\n**Medidas e composição**\n- Indicado para colchão casal padrão de até 1,58 m × 1,98 m × 30 cm de altura\n- Tecido: micropercal\n- Composição: 100% poliéster\n- Informação de tecido: 400 fios\n- Cores disponíveis: bege, verde, cinza e rosa\n\n**Atenção:** confira as medidas do colchão antes da compra para garantir o ajuste adequado.",
    rating: 5.0,
    reviews: null,
    sold: "200",
  },

];

export const getProduct = (id: string) => products.find((p) => p.id === id);

export const brl = (cents: number) =>
  "R$ " +
  (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const discountPct = (price: number, original: number) =>
  Math.round((1 - price / original) * 100);

export const unitPrice = (v: Variant) => Math.round(v.price / v.pieces);

/** Order totals: shipping is free, discount = original − price. */
export function orderTotals(price: number, original: number) {
  return { subtotal: price, original, discount: original - price, shipping: 0, total: price };
}
