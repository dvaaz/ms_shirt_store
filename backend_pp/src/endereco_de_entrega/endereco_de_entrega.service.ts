import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { uuidv7 } from 'uuidv7'; // Importa a função uuidv7 para gerar UUIDs
import { PrismaService } from 'src/database/prisma/prisma.service';
import {
  Prisma as PrismaClient,
  endereco_de_entrega as EnderecoEntregaModel,
} from '../generated/prisma/client.js';
import { CreateEnderecoDeEntregaDto as createDto } from './dto/create-endereco_de_entrega.dto';
import {
  UpdateEnderecoDeEntregaDto as updateDto,
  UpdateEnderecoDeEntregaDto,
} from './dto/update-endereco_de_entrega.dto';
import EnderecoLojaConstants, {
  EnderecoLojaConstantsType,
} from '../common/constants/endereco_loja.constants.js';

@Injectable()
export class EnderecoDeEntregaService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  private enderecoLoja: EnderecoEntregaModel[] = [];

  async onModuleInit() {
    const constantes: EnderecoLojaConstantsType = EnderecoLojaConstants;
    const uuidsDasLojas = constantes.LojasCadastradas.map((l) => l.uuidLoja);

    this.enderecoLoja = [];

    for (const uuidLoja of uuidsDasLojas) {
      try {
        const resultadosDaLoja = await this.prisma.endereco_de_entrega.findMany(
          {
            where: { endereco_uuid: uuidLoja },
          },
        );

        // 2. O '...' (spread) joga os itens para dentro do array existente sem resetá-lo
        this.enderecoLoja.push(...resultadosDaLoja);
      } catch (e: any) {
        throw new Error(`Erro ao buscar endereço de entrega: ${e.message}`);
      }
    }
  }

  /**
   * Cria um novo endereço de entrega
   * @param data
   * @returns
   */
  async create(data: createDto): Promise<EnderecoEntregaModel> {
    // verifica se o cep e o destinatário foram fornecidos
    // deve receber no header o uuid do usuário, nesse momento recebe
    try {
      if (!data.cep || data.cep.trim() === '') {
        throw new Error('O CEP é obrigatório');
      }
      if (!data.destinatario || data.destinatario.trim() === '') {
        throw new Error('O destinatário é obrigatório');
      }
      // Verifica se o usuario_uuid é válido
      // TODO: Verificar se o usuário existe no sistema, caso contrário, lançar um erro

      // Verifica se o usuario possui no máximo 3 endereços cadastrados
      const count = await this.prisma.endereco_de_entrega.count({
        where: { endereco_usuario_uuid: data.destinatario.trim() },
      });
      if (count >= 3) {
        throw new Error(
          'O usuário já possui o número máximo de endereços cadastrados',
        );
      }

      const model: Omit<
        EnderecoEntregaModel,
        'endereco_created_at' | 'endereco_updated_at'
      > = {
        endereco_uuid: uuidv7(),
        endereco_usuario_uuid: data.destinatario.trim(),
        endereco_cep: createDto.cepLimpo(data.cep),
        endereco_logradouro: data.logradouro ? data.logradouro.trim() : '',
        endereco_numero: createDto.numeroInt(data.numero),
        endereco_complemento: data.complemento ? data.complemento.trim() : '',
        endereco_municipio: data.municipio ? data.municipio.trim() : '',
        endereco_uf: data.uf ? data.uf.trim().toUpperCase() : '',
      };
      return await this.prisma.endereco_de_entrega.create({ data: model });
    } catch (e) {
      throw new Error(`Erro ao criar endereço de entrega: ${e.message}`);
    }
  }

  /**
   * Busca todos os endereços de entrega (rota Admin)
   * @param params
   * @returns
   */
  async findAll(params: {
    skip?: number; // Número de registros a pular
    take?: number; // Número de registros a buscar
    cursor?: PrismaClient.endereco_de_entregaWhereUniqueInput; // Cursor para paginação
    where?: PrismaClient.endereco_de_entregaWhereInput; // Filtros para a consulta
    orderBy?: PrismaClient.endereco_de_entregaOrderByWithRelationInput; // Ordenação dos resultados
  }): Promise<EnderecoEntregaModel[]> {
    try {
      const { skip, take, cursor, where, orderBy } = params;
      return await this.prisma.endereco_de_entrega.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      });
    } catch (e) {
      throw new Error(`Erro ao buscar endereços de entrega: ${e.message}`);
    }
  }

  /**
   * Busca por todos os endereços de entrega de um usuário especifico. Cada usuário tem um máximo de 3 endereços cadastrados
   * @param usuario_uuid
   * @returns
   */
  async findAllByUsuario(user: string): Promise<EnderecoEntregaModel[]> {
    try {
      // Verifica se o usuario_uuid é válido
      // TODO: Verificar se o usuário existe no sistema, caso contrário, lançar um erro
      return await this.prisma.endereco_de_entrega.findMany({
        where: { endereco_usuario_uuid: user },
        orderBy: { endereco_created_at: 'desc' },
      });
    } catch (e) {
      throw new Error(
        `Erro ao buscar endereços de entrega do usuário: ${e.message}`,
      );
    }
  }

  /**
   * Busca por um endereço de entrega por id
   * @param input
   * @returns
   */
  async findOne(
    user: string,
    input: string,
  ): Promise<EnderecoEntregaModel | null> {
    // Verifica se o usuario_uuid é válido
    // TODO: Verificar se o usuário existe no sistema, caso contrário, lançar um erro
    if (!user) {
      throw new Error('Usuário não fornecido');
    }

    if (!input) {
      throw new Error('Id não fornecido');
    }

    // Verifica se o endereço é da loja cadastrada
    const enderecoLoja = this.enderecoLoja.find(
      (e) => e.endereco_uuid === input,
    );
    // se estiver retorna o EXATO endereco do uuid input apenas
    if (enderecoLoja) {
      return enderecoLoja;
    }

    const endereco = await this.prisma.endereco_de_entrega
      .findUnique({
        where: { endereco_uuid: input, endereco_usuario_uuid: user },
      })
      .catch((e) => {
        throw new Error(`Erro ao buscar endereço de entrega: ${e.message}`);
      });

    if (!endereco && !enderecoLoja) {
      throw new Error('Endereço de entrega não encontrado');
    }
    if (endereco && endereco.endereco_usuario_uuid !== user) {
      throw new Error('Endereço de entrega não pertence ao usuário');
    }

    return endereco;
  }

  /**
   * Atualiza um endereço de entrega por id
   * @param id
   * @param data
   * @returns
   */
  async update(
    id: string,
    user: string,
    data: UpdateEnderecoDeEntregaDto,
  ): Promise<EnderecoEntregaModel> {
    try {
      // Verifica se o endereço existe antes de tentar atualizar
      const existing = await this.prisma.endereco_de_entrega.findUnique({
        where: { endereco_uuid: id, endereco_usuario_uuid: user },
      });
      // Se o endereço não existir, lança um erro
      if (!existing) {
        throw new Error('Endereço de entrega não encontrado');
      }

      const updateData: PrismaClient.endereco_de_entregaUpdateInput = {};

      if (data.cep !== undefined) {
        updateData.endereco_cep = createDto.cepLimpo(data.cep);
        if (updateData.endereco_cep === '') {
          throw new Error('O CEP não pode ser vazio');
        }
      }
      if (data.logradouro !== undefined) {
        updateData.endereco_logradouro = data.logradouro.trim();
      }
      if (data.numero !== undefined) {
        updateData.endereco_numero = createDto.numeroInt(data.numero);
      }
      if (data.complemento !== undefined) {
        updateData.endereco_complemento = data.complemento.trim();
      }
      if (data.municipio !== undefined) {
        updateData.endereco_municipio = data.municipio.trim();
      }
      if (data.uf !== undefined) {
        updateData.endereco_uf = data.uf.trim().toUpperCase();
      }

      return await this.prisma.endereco_de_entrega.update({
        // cria um objeto de atualização com os campos fornecidos
        where: { endereco_uuid: id, endereco_usuario_uuid: user },
        data: {
          ...updateData,
          endereco_updated_at: new Date(),
        },
      });
    } catch (e) {
      throw new Error(`Erro ao atualizar endereço de entrega: ${e.message}`);
    }
  }

  /**
   * Deleta um endereço de entrega por id
   * @param id
   * @returns
   */
  async remove(id: string, user: string): Promise<boolean> {
    try {
      // Verifica se o endereço existe antes de tentar deletar
      const existing = await this.prisma.endereco_de_entrega.findUnique({
        where: { endereco_uuid: id, endereco_usuario_uuid: user },
      });
      // Se o endereço não existir, retorna false
      if (!existing) {
        return false;
      }
      // Tenta deletar o endereço
      await this.prisma.endereco_de_entrega.delete({
        where: { endereco_uuid: id, endereco_usuario_uuid: user },
      });
      // Se a deleção for bem-sucedida, retorna true
      return true;
    } catch (e) {
      throw new Error(`Erro ao deletar endereço de entrega: ${e.message}`);
    }
  }
}
