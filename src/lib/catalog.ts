
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
    category: "Karsten · Cama, mesa e banho",
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
    description: "Jogo de toalhas Karsten Bosco com 4 peças, em uma combinação elegante de tons Vanilla e Marrom. O conjunto inclui 2 toalhas de banho de 135 × 70 cm e 2 toalhas de rosto, unindo praticidade, conforto e um visual clássico para o banheiro. Uma escolha versátil para renovar o dia a dia e proporcionar uma agradável sensação de bem-estar após o banho.",
    rating: 4.8, reviews: null, sold: "7,8 mil",
  },
  {
    id: "chaleira-unitermi-atacama",
    title: "Chaleira Elétrica Unitermi Atacama · 1,8L",
    cardTitle: "Chaleira Elétrica Unitermi Atacama · 1,8L",
    checkoutTitle: "Chaleira Elétrica Unitermi Atacama · 1,8L",
    category: "Unitermi · Eletroportáteis",
    price: 3623,
    original: 4990,
    shippingOriginal: 2620,
    image: "/chaleira%20uniterm%201.png",
    gallery: [
      "/chaleira%20uniterm%201.png",
      "/chaleira%20uniterm%202.png",
      "/chaleira%20uniterm%203.png",
      "/chaleira%20uniterm%204.png",
      "/chaleira%20uniterm%205.png",
    ],
    variants: [
      { id: "chaleira-127v", line: "Tensão", color: "127V", description: "Versão 127V", price: 3623, original: 4990, pieces: 1, image: "/chaleira%20uniterm%201.png" },
      { id: "chaleira-220v", line: "Tensão", color: "220V", description: "Versão 220V", price: 3623, original: 4990, pieces: 1, image: "/chaleira%20uniterm%201.png" },
    ],
    description: "Prepare café, chá, chimarrão e outras bebidas com praticidade. A chaleira elétrica tem capacidade de 1,8 L, acabamento em aço inox e aquecimento rápido, ideal para casa ou trabalho.\n\nDisponível em 127V ou 220V. Não é bivolt: selecione a voltagem compatível com sua residência antes de comprar.",
    rating: 4.7, reviews: null, sold: "2,4 mil",
  },
  {
    id: "arvore-natal-kit-87-enfeites",
    title: "Árvore de Natal 1,20 m + Kit com 87 Enfeites",
    cardTitle: "Árvore de Natal 1,20 m + 87 Enfeites",
    checkoutTitle: "Árvore de Natal 1,20 m com Kit de 87 Enfeites",
    category: "Natal · Decoração",
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
    category: "Eletrônicos · Natal · Recomendados",
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
    category: "Mondial · Eletroportáteis",
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
    category: "Casa & Utilidades · Recomendados · Natal · 25.12",
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
    category: "Casa & Utilidades · Eletrônicos · Mais vendidos",
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
    category: "Mondial · Eletroportáteis · Casa & Utilidades · Eletrônicos · Natal · 25.12 · Mais vendidos · Recomendados",
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
    category: "Brinquedos · Infantil · Presentes · Natal · 25.12 · Mais vendidos · Recomendados",
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
    category: "Brinquedos · Infantil · Presentes · Barbie · Casa & Utilidades · Natal · 25.12 · Mais vendidos · Recomendados",
    price: 29385,
    original: 269999,
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
