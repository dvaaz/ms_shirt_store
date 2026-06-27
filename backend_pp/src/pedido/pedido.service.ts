import { Prisma as PrismaNameSpace } from '../generated/prisma/client.js';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { CreateItemPedidoDto } from '../item_pedido/dto/create-item_pedido.dto';
import { uuidv7 } from 'uuidv7';
import got from 'got';
import { EnderecoDeEntregaService } from '../endereco_de_entrega/endereco_de_entrega.service';
import { PrismaService } from '../database/prisma/prisma.service';
import {
  Prisma as PrismaClient,
  item_pedido as ItemPedidoModel,
  pedido as PedidoModel,
  status_pedido as StatusPedidoModel,
  endereco_de_entrega as EnderecoEntregaModel,
} from '../generated/prisma/client.js';
import { ItemPedidoService } from '../item_pedido/item_pedido.service';
import { StatusPedidoService } from '../status_pedido/status_pedido.service.js';
import { FullPedidoDto } from './dto/full-pedido.dto.js';
import { error } from 'console';
import { ResponseListaPedidoDTO } from './dto/response-lista-pedido.dto.js';

@Injectable()
export class PedidoService implements OnModuleInit {
  private readonly uuidv7Regex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

  private readonly status = new Map<string, number>();

  // Ao iniciar o modulo carrega os status do pedido e os armazena no Map
  async onModuleInit() {
    const statusPedido = await this.prisma.status_pedido.findMany({
      select: {
        status_pedido_id: true,
        status_pedido_nome: true,
      },
    });

    statusPedido
      .filter(
        (status): status is typeof status & { status_pedido_nome: string } =>
          status.status_pedido_nome !== null,
      )
      .forEach((status) => {
        this.status.set(status.status_pedido_nome, status.status_pedido_id);
      });
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly entrega: EnderecoDeEntregaService,
    private readonly produtoPedido: ItemPedidoService,
    private readonly statusPedido: StatusPedidoService,
  ) {}

  /**
   * NÃO UTILIZAR PARA PARCELAMENTO
   * Converte a saida para centavos
   * @param valor
   */
  private valueToCentsSimple(valor: number): string {
    // Divide para exibir o valor em centavos para o usuário. 2f para garantir que o valor seja exibido com 2 casas decimais, mesmo que seja um número inteiro.
    const response = Math.round(valor / 100).toFixed(2);
    return response;
  }

  /**
   * Função para um retorno legivel do pedido criado. Inclui array de itens do pedido e seus devidos preços, nome do status do pedido
   * @params userGuid, pedidoGuid
   */
  async composePedido(
    userId: string,
    pedidoId: string,
  ): Promise<FullPedidoDto> {
    // TO DO: Validar usuario
    const pedido = await this.prisma.pedido
      .findUnique({
        where: {
          pedido_uuid: pedidoId,
          usuario_uuid: userId,
        },
        select: {
          pedido_uuid: true,
          pedido_valor_total: true,
          pedido_created_at: true,
          pedido_updated_at: true,
          pedido_nome_destinatario: true,
          status_pedido: {
            select: {
              status_pedido_nome: true,
            },
          },
          endereco_de_entrega: {
            select: {
              endereco_cep: true,
              endereco_uf: true,
              endereco_municipio: true,
              endereco_logradouro: true,
              endereco_numero: true,
              endereco_complemento: true,
            },
          },
          item_pedido: {
            select: {
              item_pedido_nome_produto: true,
              item_pedido_preco: true,
              item_pedido_quantidade: true,
              item_pedido_id: true,
            },
          },
        },
      })
      .catch((error) => {
        throw new NotFoundException(`Pedido não foi encontrado.`);
      });
    if (!pedido || !pedido.status_pedido.status_pedido_nome) {
      throw new NotFoundException(`Pedido não foi encontrado.`);
    }
    if (!pedido.item_pedido || pedido.item_pedido.length === 0) {
      throw new NotFoundException(`Itens do pedido não foram encontrados.`);
    }

    const response: FullPedidoDto = {
      pedido_id: pedido.pedido_uuid,
      pedido_valor_total: this.valueToCentsSimple(pedido.pedido_valor_total),
      pedido_status: pedido.status_pedido.status_pedido_nome,
      data_criacao: pedido.pedido_created_at,
      data_atualizacao: pedido.pedido_updated_at,
      endereco_entrega: {
        destinatario: pedido.pedido_nome_destinatario,
        cep: pedido.endereco_de_entrega.endereco_cep,
        uf: pedido.endereco_de_entrega.endereco_uf,
        municipio: pedido.endereco_de_entrega.endereco_municipio,
        logradouro: pedido.endereco_de_entrega.endereco_logradouro,
        numero: pedido.endereco_de_entrega.endereco_numero,
        complemento: pedido.endereco_de_entrega.endereco_complemento || '',
      },
      produto_pedido: pedido.item_pedido.map((item) => ({
        // ao contrario dos DTOS anteriores o item pedido tem os nomes iguais aos do DB.
        produto_nome: item.item_pedido_nome_produto,
        preco_unitario: this.valueToCentsSimple(item.item_pedido_preco),
        quantidade: item.item_pedido_quantidade,
        id_produto: item.item_pedido_id,
      })),
    };

    return response;
  }

  /**
   * Recebe o id do usuário e uma string de itens do pedido e retorna a confirmação de criação do pedido.
   * @param createPedidoDto
   * @returns
   */
  async create(user: string, createPedidoDto: CreatePedidoDto) {
    // Como o UUID do usuário virá da API de carrinho, pulamos a etapa de validação do mesmo, podemos apenas validar o carrinho (por segurança).
    // TODO: Lógica de validação do carrinho do usuário para garantir que os itens do pedido sejam válidos. Ou isso vem do projeto carrinho
    let endereco: Pick<EnderecoEntregaModel, 'endereco_uuid'> | null = null;

    if (
      createPedidoDto.endereco_id &&
      createPedidoDto.endereco_id.trim() !== '' &&
      createPedidoDto.endereco_id.length === 36 &&
      this.uuidv7Regex.test(createPedidoDto.endereco_id)
    ) {
      try {
        const resultEndereco = await this.prisma.endereco_de_entrega.findUnique(
          {
            where: {
              endereco_uuid: createPedidoDto.endereco_id,
              endereco_usuario_uuid: user,
            },
            select: {
              endereco_uuid: true,
            },
          },
        );
        endereco = resultEndereco;
      } catch (error) {
        // Ignora o erro e continua
      }
    } else if (
      !createPedidoDto.endereco_id ||
      createPedidoDto.endereco_id.trim() === '' ||
      createPedidoDto.endereco_id.length === 0
    ) {
      try {
        endereco = await this.prisma.endereco_de_entrega.findFirst({
          where: { endereco_usuario_uuid: user },
        });
      } catch (error) {
        // Ignora o erro e continua
      }
    }

    // Confirma que o pedido não está vazio
    if (
      !createPedidoDto.itens_pedido ||
      createPedidoDto.itens_pedido.length === 0
    ) {
      throw new BadRequestException('O pedido deve conter pelo menos um item');
    }

    // cria GUID do pedido
    const pedidoUuid = uuidv7(); // Gera um UUID para o pedido utilizando a função uuid versao 7

    const statusPedidoIdPendente = this.status.get('PENDENTE') || 1;
    if (!statusPedidoIdPendente) {
      throw new NotFoundException('Status do pedido não encontrado');
    }

    // Cria o pedido para poder criar os itens
    const pedido = {
      pedido_uuid: pedidoUuid,
      usuario_uuid: user,
      pedido_nome_destinatario:
        createPedidoDto.destinatario || 'Destinatário não informado',
      endereco_de_entrega_uuid: endereco?.endereco_uuid || '',
      pedido_valor_total: 0,
      status_pedido_id: statusPedidoIdPendente,
    };

    // Cria um array para armazenar as IDs do item do pedido vindos no dto CreatePedidoDto.
    const createPedido = await this.prisma.pedido.create({
      data: pedido,
    });

    const produtosPedido: Omit<CreateItemPedidoDto, 'pedido_uuid'>[] = [];

    for (const item of createPedidoDto.itens_pedido) {
      const produto: Omit<CreateItemPedidoDto, 'pedido_uuid'> = {
        produto_id: item.produto_id,
        item_quantidade: item.item_quantidade,
        produto_nome: item.produto_nome,
        produto_preco: item.produto_preco,
      };
      produtosPedido.push(produto);
    }

    // Insere os Itens do pedido e devolve o valor total
    const [createProdutosPedido, valorTotalDoPedido] =
      await this.produtoPedido.create(pedidoUuid, produtosPedido);

    // Caso haja problema em anexar os itens ao pedido
    if (!createProdutosPedido || createProdutosPedido.length === 0) {
      const statusPedidoIdRejeitado = this.status.get('REJEITADO') || 12;

      // Atualiza o status do pedido para REJEITADO e retorna a funcao
      const response = await this.prisma.pedido.update({
        where: { pedido_uuid: pedidoUuid },
        data: { status_pedido_id: statusPedidoIdRejeitado },
      });
      return {
        usuario_uuid: response.usuario_uuid,
        pedido_uuid: response.pedido_uuid,
      };
    }

    // Incluir o valor total do pedido dos itens que foram ao pedido

    const statusPedidoIdAprovado = this.status.get('APROVADO') || 6;
    const response = await this.prisma.pedido
      .update({
        where: { pedido_uuid: pedidoUuid },
        data: {
          pedido_valor_total: valorTotalDoPedido,
          status_pedido_id: statusPedidoIdAprovado,
        },
        select: {
          pedido_uuid: true,
          usuario_uuid: true,
        },
      })
      .catch((error) => {
        throw new InternalServerErrorException(
          `Erro ao atualizar o valor total do pedido: ${error instanceof Error ? error.message : String(error)}`,
        );
      });

    // NOTA: Porvavelmente o return torne-se desnecessário. Já que compose pedido está criado

    return {
      usuario_uuid: response.usuario_uuid,
      pedido_uuid: response.pedido_uuid,
    };
  }

  /**
   * Buscar todos os Pedidos referentes a UM usuario
   * @param userId
   * @returns
   */
  async findAllComplete(
    userId: string,
  ): Promise<Omit<FullPedidoDto, 'endereco_entrega'>[]> {
    try {
      const pedidos = await this.prisma.pedido.findMany({
        where: { usuario_uuid: userId },
        select: {
          pedido_uuid: true,
          pedido_valor_total: true,
          pedido_created_at: true,
          pedido_updated_at: true,
          status_pedido: {
            select: {
              status_pedido_nome: true,
            },
          },
          item_pedido: {
            select: {
              item_pedido_nome_produto: true,
              item_pedido_preco: true,
              item_pedido_quantidade: true,
              item_pedido_id: true,
            },
          },
        },
      });
      if (!pedidos || pedidos.length === 0) {
        throw new NotFoundException(`Nenhum pedido encontrado para o usuário.`);
      }
      if (
        pedidos.some(
          (pedido) =>
            !pedido.status_pedido || !pedido.status_pedido.status_pedido_nome,
        )
      ) {
        throw new NotFoundException(
          `Status do pedido não encontrado para um ou mais pedidos. Contatar o Administrador`,
        );
      }

      const response: Omit<FullPedidoDto, 'endereco_entrega'>[] = pedidos.map(
        (pedido) => ({
          pedido_id: pedido.pedido_uuid,
          pedido_valor_total: this.valueToCentsSimple(
            pedido.pedido_valor_total,
          ),
          pedido_status:
            pedido.status_pedido?.status_pedido_nome || 'Status não encontrado',
          data_criacao: pedido.pedido_created_at,
          data_atualizacao: pedido.pedido_updated_at,
          produto_pedido: pedido.item_pedido.map((item) => ({
            produto_nome: item.item_pedido_nome_produto,
            preco_unitario: this.valueToCentsSimple(item.item_pedido_preco),
            quantidade: item.item_pedido_quantidade,
            id_produto: item.item_pedido_id,
          })),
        }),
      );

      return response;
    } catch (error) {
      throw new BadRequestException(
        `Não foi possivel encontrar os pedidos ${error}`,
      );
    }
  }

  /**
   * Find all que traz apenas a UUId do Pedido, status, quando foi criado o pedido
   */
  async findAllSimple(userId: string): Promise<ResponseListaPedidoDTO[]> {
    try {
      const pedidos = await this.prisma.pedido.findMany({
        where: { usuario_uuid: userId },
        select: {
          pedido_uuid: true,
          pedido_valor_total: true,
          pedido_created_at: true,
          status_pedido: {
            select: {
              status_pedido_nome: true,
            },
          },
        },
      });
      if (!pedidos || pedidos.length === 0) {
        throw new NotFoundException(`Nenhum pedido encontrado para o usuário.`);
      }
      if (
        pedidos.some(
          (pedido) =>
            !pedido.status_pedido || !pedido.status_pedido.status_pedido_nome,
        )
      ) {
        throw new NotFoundException(
          `Status do pedido não encontrado para um ou mais pedidos. Contatar o Administrador`,
        );
      }

      const response: ResponseListaPedidoDTO[] = pedidos.map((pedido) => ({
        pedido_uuid: pedido.pedido_uuid,
        pedido_valor_total: this.valueToCentsSimple(pedido.pedido_valor_total),
        status_pedido:
          pedido.status_pedido?.status_pedido_nome || 'Status não encontrado',
        pedido_created_at: pedido.pedido_created_at,
      }));

      return response;
    } catch (error) {
      throw new BadRequestException(
        `Não foi possivel encontrar os pedidos ${error}`,
      );
    }
  }

  /**
   *
   * @param id Busca por um pedido
   * @returns
   */
  async findOne(id: string): Promise<PedidoModel> {
    try {
      const pedido = await this.prisma.pedido.findUnique({
        where: { pedido_uuid: id },
      });

      // Se o Prisma não encontrar, ele retorna null. Tratamos com a Exception nativa do NestJS
      if (!pedido) {
        throw new NotFoundException(
          `Pedido com o UUID ${id} não foi encontrado.`,
        );
      }

      return pedido;
    } catch (error) {
      // Se a exceção já for do NestJS (o NotFoundException acima), apenas a repasse adiante
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Erros de banco de dados (ex: string de UUID malformada ou falha de conexão) caem aqui
      const mensagemErro =
        error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Erro ao buscar o pedido: ${mensagemErro}`,
      );
    }
  }

  /**
   * Atualiza o status do pedido para o próximo status na sequência.
   * @param id
   */
  async updateStatusPedido(id: string) {
    const statusAtual = await this.prisma.pedido
      .findUnique({
        where: { pedido_uuid: id },
        select: {
          status_pedido_id: true,
          status_pedido: {
            select: {
              status_pedido_nome: true,
              status_pedido_id: true,
            },
          },
        },
      })
      .catch((error) => {
        // Alterado para o erro padrao de find do Prisma
        if (
          error instanceof PrismaClient.PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          throw new NotFoundException(`Pedido não foi encontrado.`);
        }
        throw error;
      });

    console.log('Pedido Service:', statusAtual);

    if (
      !statusAtual?.status_pedido ||
      !statusAtual.status_pedido.status_pedido_nome
    ) {
      throw new NotFoundException(`Pedido não foi encontrado.`);
    }

    const nomeStatus = statusAtual.status_pedido.status_pedido_nome;
    // verifica se o nome do status existe no Map de status, se existir tenta atualizar o status no banco de dados
    if (nomeStatus in this.status) {
      const novoStatusId: number = this.status.get(nomeStatus)!;
      console.log('Novo Status ID:', novoStatusId);
      if (!novoStatusId) {
        throw new BadRequestException(
          `Não foi possível atualizar o status do pedido com o UUID ${id}. Status atual: ${statusAtual.status_pedido}`,
        );
      }
    } else {
      // Presando responsabilidade unica essa funcao nao bloqueia os pedidos cancelados, rejeitados ou entregues. Apesar de que eu acredite que isso pouparia microsegundos do processo
      const novoStatusId: number =
        await this.statusPedido.updateStatusPedido(nomeStatus);
      console.log('Novo Status ID:', novoStatusId);
      if (!novoStatusId) {
        throw new BadRequestException(
          `Não foi possível atualizar o status do pedido com o UUID ${id}. Status atual: ${statusAtual.status_pedido}`,
        );
      }
      // transforma o novoStatusId em number

      const statusAtualizado = await this.prisma.pedido.update({
        where: { pedido_uuid: id },
        data: { status_pedido_id: novoStatusId },
      });

      if (!statusAtualizado) {
        throw new NotFoundException(
          `Não foi possível atualizar o status do pedido com o UUID ${id}.`,
        );
      }

      return true;
    }
  }

  /**
   * Altera o endereço de entrega de um pedido específico. Recebe o ID do pedido e o ID do novo endereço de entrega.
   * @param id
   * @param endereco_id
   */
  async updateEndereco(id: string, endereco_id: string) {
    try {
      const pedido = await this.prisma.pedido.findUniqueOrThrow({
        where: { pedido_uuid: id },
        select: {
          pedido_uuid: true,
          usuario_uuid: true,
          status_pedido: {
            select: {
              status_pedido_nome: true,
            },
          },
        },
      });

      if (!pedido) {
        throw new NotFoundException(`Pedido não encontrado.`);
      }
      if (
        pedido.status_pedido.status_pedido_nome !== 'ACEITO' &&
        pedido.status_pedido.status_pedido_nome !== 'PENDENTE'
      ) {
        throw new BadRequestException(
          `Não é permitido alterar o endereço de entrega para este status de pedido.`,
        );
      }

      // Busca o endereço de entrega para garantir que ele exista e pertença ao mesmo usuário do pedido
      const endereco = this.prisma.endereco_de_entrega.findFirst({
        where: {
          endereco_uuid: endereco_id,
          endereco_usuario_uuid: pedido.usuario_uuid,
        },
      });

      if (!endereco) {
        throw new NotFoundException(
          `Endereço de entrega não encontrado para o usuário.`,
        );
      }

      // Atualiza o endereço de entrega do pedido
      try {
        const updatedPedido = await this.prisma.pedido.update({
          where: { pedido_uuid: id },
          data: {
            endereco_de_entrega_uuid: endereco_id,
          },
        });
      } catch (error) {
        if (
          error instanceof PrismaNameSpace.PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          // Registro não encontrado
          return null;
        }
        throw error; // Re-throw outros erros
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const mensagemErro =
        error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Erro ao atualizar o endereço de entrega: ${mensagemErro}`,
      );
    }
  }

  /**
   * Valida se o usuario comprou a compra para ter o selo nos comentarios
   */
  async verificaCompraRealizada(
    userId: string,
    compraId: string,
  ): Promise<boolean> {
    const request = await this.prisma.pedido
      .findUnique({
        where: { pedido_uuid: compraId, usuario_uuid: userId },
        select: {
          status_pedido: {
            select: {
              status_pedido_nome: true,
            },
          },
        },
      })
      .catch((error) => {
        throw new InternalServerErrorException('Erro ao validar compra');
      });

    if (!request || !request.status_pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }

    if (
      request.status_pedido.status_pedido_nome === 'ENTREGUE' ||
      request.status_pedido.status_pedido_nome === 'DEVOLUCAO'
    ) {
      return false;
    }
    return true;
  }
}
