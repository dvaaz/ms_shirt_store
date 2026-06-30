export type Loja = {
  id: string;
  nome: string;
  uuidLoja: string;
};

export type EnderecoLojaConstantsType = {
  LojasCadastradas: Loja[];
};

const EnderecoLojaConstants: EnderecoLojaConstantsType = {
  LojasCadastradas: [
    {
      id: '3667be7d-7416-11f1-82b7-005056a4845d',
      nome: 'Loja_A',
      uuidLoja: 'LojaUUID-1875',
    },
  ],
};

export default EnderecoLojaConstants;
