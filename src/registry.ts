import { useQuery } from '@tanstack/react-query';
import * as z from 'zod';

export const registryURL = '/registry-proxy';
export const registryJSONURL = `${registryURL}/registry.json`;

export const otherInfoSchema = z.object({
  agoraTestnetParams: z.unknown(),
  agoraMainnetParams: z.unknown(),
  liqwidTestnetParams: z.unknown(),
  liqwidMainnetParams: z.unknown(),
  oracleTestnetParams: z.unknown(),
  oracleMainnetParams: z.unknown(),
  otherMainnetAssets: z.record(z.unknown()),
  otherTestnetAssets: z.record(z.unknown()),
  coingeckoId: z.record(z.string()).optional(),
  assetMetadata: z.record(z.unknown()),
  marketMetadata: z.record(z.unknown()),
});

export type OtherInfo = z.infer<typeof otherInfoSchema>;

export type ScriptType = 'Validator' | 'MintingPolicy' | 'StakeValidator';

export const scriptInfoSchema = z.object({
  type: z.union([
    z.literal('Validator'),
    z.literal('MintingPolicy'),
    z.literal('StakeValidator'),
  ]),
  name: z.string(),
  tag: z.string(),
  network: z
    .object({
      tag: z.string(),
    })
    .optional(),
  description: z.string().optional(),
  scriptHash: z.string(),
  deployment: z.union([
    z.object({
      type: z.literal('lockedAt'),
      referenceUtxo: z.object({
        output: z.object({
          scriptRef: z.object({
            tag: z.literal('PlutusScriptRef'),
            contents: z.tuple([z.string(), z.literal('PlutusV2')]),
          }),
          output: z.object({
            referenceScript: z.string(),
            datum: z.unknown().optional(),
            address: z.object({
              addressStakingCredential: z.null(),
              addressCredential: z.object({
                tag: z.enum(['ScriptCredential', 'PubKeyCredential']),
                contents: z.string(),
              }),
            }),
          }),
        }),
        input: z.object({
          transactionId: z.string(),
          index: z.number(),
        }),
      }),
    }),
    z.object({
      type: z.literal('notDeployed'),
      version: z.literal('PlutusV2'),
      rawHex: z.string(),
    }),
  ]),
  componentName: z.string().optional(),
  domain: z.unknown().optional(),
  market: z.string().optional(),
});

export type ScriptInfo = z.infer<typeof scriptInfoSchema>;

export const registrySchema = z.object({
  scriptInfos: z.array(scriptInfoSchema),
  other: otherInfoSchema.optional(),
});

export type Registry = z.infer<typeof registrySchema>;

export const getRegistry = async (): Promise<Registry> => {
  const response = await fetch(`${registryURL}/registry.json`);
  const json = await response.json();

  const res = registrySchema.safeParse(json);
  if (!res.success) {
    console.error(res.error);
  }

  return registrySchema.parse(json);
};

export const useRegistry = () => {
  return useQuery({
    queryKey: ['registry'],
    queryFn: () => getRegistry(),
    staleTime: 10_000,
  });
};
