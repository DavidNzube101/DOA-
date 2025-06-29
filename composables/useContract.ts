import { ref, computed } from 'vue'
import { AnchorProvider, Program, web3, Idl } from '@project-serum/anchor'
import { useEnvironment } from './useEnvironment'
import idl from '~/DOA-Contract/idl.json'

export function useContract() {
  const { rpcUrl, programId, networkName, isValidConfiguration } = useEnvironment()

  const connection = computed(() => new web3.Connection(rpcUrl.value, 'confirmed'))
  const provider = ref<AnchorProvider | null>(null)
  const program = ref<Program | null>(null)
  const ready = ref(false)
  const error = ref<string | null>(null)

  async function init(wallet?: any) {
    try {
      error.value = null
      // If wallet is provided, use it; else, use a dummy wallet (read-only)
      const anchorProvider = new AnchorProvider(
        connection.value,
        wallet || {
          publicKey: null,
          signAllTransactions: async (txs: any) => txs,
          signTransaction: async (tx: any) => tx,
        },
        { preflightCommitment: 'confirmed' }
      )
      provider.value = anchorProvider
      program.value = new Program(idl as Idl, programId.value, anchorProvider)
      ready.value = true
    } catch (e: any) {
      error.value = e.message || 'Failed to initialize contract client'
      ready.value = false
    }
  }

  return {
    connection,
    provider,
    program,
    ready,
    error,
    networkName,
    isValidConfiguration,
    init
  }
} 