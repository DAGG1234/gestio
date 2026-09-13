// src/stores/useFinanceStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'

export type PetMood = 'happy' | 'neutral' | 'sad'

export interface FinancialAdvice {
  mood: PetMood
  title: string
  message: string
  badgeColor: string
}

export interface Transaction {
  id: string
  type: 'income' | 'expense' | 'saving_contribution' | 'debt_payment'
  category: string
  description: string
  amount: number
  date: string
  savingsGoalId?: string
  debtGoalId?: string
}

export interface SavingContribution {
  id: string
  goalId: string
  amount: number
  amountInBaseCurrency: number
  date: string
  transactionId?: string
}

export interface SavingGoal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  currency: 'USD' | 'VES'
  isCompleted: boolean
  createdAt: string
}

export interface DebtPayment {
  id: string
  debtId: string
  amount: number
  amountInBaseCurrency: number
  date: string
  transactionId?: string
}

export interface DebtGoal {
  id: string
  title: string
  totalAmount: number
  remainingAmount: number
  currency: 'USD' | 'VES'
  isPaidOff: boolean
  createdAt: string
}

export const useFinanceStore = defineStore('finance', () => {
  const transactions = ref<Transaction[]>([])
  const savingGoals = ref<SavingGoal[]>([])
  const savingContributions = ref<SavingContribution[]>([])
  const debtGoals = ref<DebtGoal[]>([])
  const debtPayments = ref<DebtPayment[]>([])
  const isLoading = ref<boolean>(false)

  // Sincronizar estado completo con localStorage para persistencia offline
  const saveToLocalStorage = () => {
    localStorage.setItem('gestio_transactions', JSON.stringify(transactions.value))
    localStorage.setItem('gestio_saving_goals', JSON.stringify(savingGoals.value))
    localStorage.setItem('gestio_saving_contributions', JSON.stringify(savingContributions.value))
    localStorage.setItem('gestio_debt_goals', JSON.stringify(debtGoals.value))
    localStorage.setItem('gestio_debt_payments', JSON.stringify(debtPayments.value))
  }

  const loadFromLocalStorage = () => {
    try {
      const tx = localStorage.getItem('gestio_transactions')
      const goals = localStorage.getItem('gestio_saving_goals')
      const contribs = localStorage.getItem('gestio_saving_contributions')
      const debts = localStorage.getItem('gestio_debt_goals')
      const payments = localStorage.getItem('gestio_debt_payments')

      if (tx) transactions.value = JSON.parse(tx)
      if (goals) savingGoals.value = JSON.parse(goals)
      if (contribs) savingContributions.value = JSON.parse(contribs)
      if (debts) debtGoals.value = JSON.parse(debts)
      if (payments) debtPayments.value = JSON.parse(payments)
    } catch (e) {
      console.error('Error al cargar datos locales de respaldo:', e)
    }
  }

  // Obtener el ID del usuario autenticado actualmente de forma robusta
  const getUserId = async (): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) return user.id

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) return session.user.id
    } catch (e) {
      // Si falla por falta de red, permitimos continuar de forma local si hay sesión previa
    }
    throw new Error('No hay una sesión activa en Supabase o estás sin conexión.')
  }

  // Cargar todos los datos desde Supabase con respaldo offline
  const fetchAllData = async () => {
    isLoading.value = true
    try {
      const userId = await getUserId()

      const [txRes, goalsRes, contribRes, debtsRes, paymentsRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('saving_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('saving_contributions').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('debt_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('debt_payments').select('*').eq('user_id', userId).order('date', { ascending: false })
      ])

      if (txRes.error) throw txRes.error
      if (goalsRes.error) throw goalsRes.error
      if (contribRes.error) throw contribRes.error
      if (debtsRes.error) throw debtsRes.error
      if (paymentsRes.error) throw paymentsRes.error

      transactions.value = (txRes.data || []).map(t => ({
        id: t.id,
        type: t.type,
        category: t.category,
        description: t.description,
        amount: Number(t.amount),
        date: t.date,
        savingsGoalId: t.savings_goal_id || undefined,
        debtGoalId: t.debt_goal_id || undefined
      }))

      savingGoals.value = (goalsRes.data || []).map(g => ({
        id: g.id,
        title: g.title,
        targetAmount: Number(g.target_amount),
        currentAmount: Number(g.current_amount),
        currency: g.currency,
        isCompleted: g.is_completed,
        createdAt: g.created_at
      }))

      savingContributions.value = (contribRes.data || []).map(c => ({
        id: c.id,
        goalId: c.goal_id,
        amount: Number(c.amount),
        amountInBaseCurrency: Number(c.amount_in_base_currency),
        date: c.date,
        transactionId: c.transaction_id || undefined
      }))

      debtGoals.value = (debtsRes.data || []).map(d => ({
        id: d.id,
        title: d.title,
        totalAmount: Number(d.total_amount),
        remainingAmount: Number(d.remaining_amount),
        currency: d.currency,
        isPaidOff: d.is_paid_off,
        createdAt: d.created_at
      }))

      debtPayments.value = (paymentsRes.data || []).map(p => ({
        id: p.id,
        debtId: p.debt_id,
        amount: Number(p.amount),
        amountInBaseCurrency: Number(p.amount_in_base_currency),
        date: p.date,
        transactionId: p.transaction_id || undefined
      }))

      // Guardar copia actualizada en caché local
      saveToLocalStorage()

    } catch (error) {
      console.warn('Sin conexión a internet. Cargando datos locales de respaldo...', error)
      loadFromLocalStorage()
    } finally {
      isLoading.value = false
    }
  }

  const totalIncome = computed(() => {
    return transactions.value
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0)
  })

  const totalExpense = computed(() => {
    return transactions.value
      .filter((t) => t.type === 'expense' || t.type === 'saving_contribution' || t.type === 'debt_payment')
      .reduce((acc, t) => acc + t.amount, 0)
  })

  const totalBalance = computed(() => totalIncome.value - totalExpense.value)

  const totalSavingsAccumulated = computed(() => {
    return savingGoals.value.reduce((acc, goal) => acc + goal.currentAmount, 0)
  })

  const totalDebtRemaining = computed(() => {
    return debtGoals.value.reduce((acc, debt) => acc + debt.remainingAmount, 0)
  })

  const petMood = computed<PetMood>(() => {
    const income = totalIncome.value || 0
    const expenses = totalExpense.value || 0
    if (income === 0) return expenses > 0 ? 'sad' : 'neutral'
    const ratio = expenses / income
    if (ratio >= 0.85) return 'sad'
    if (ratio >= 0.60) return 'neutral'
    return 'happy'
  })

  const financialAdvice = computed<FinancialAdvice>(() => {
    const income = totalIncome.value
    const expenses = totalExpense.value
    const balance = totalBalance.value
    const mood = petMood.value

    if (income === 0 && expenses === 0) {
      return {
        mood: 'neutral',
        title: '¡Comencemos el registro!',
        message: 'Aún no tienes movimientos registrados. Añade tus ingresos y gastos para que pueda ayudarte a cuidar tu dinero.',
        badgeColor: 'amber'
      }
    }

    if (mood === 'sad') {
      return {
        mood: 'sad',
        title: '¡Alerta de gastos altos!',
        message: `Has gastado el ${Math.round((expenses / income) * 100 || 0)}% de tus ingresos. Tus egresos (Bs. ${expenses.toLocaleString('es-VE', { minimumFractionDigits: 2 })}) están comprometiendo tu balance. ¡Cuidado con los gastos hormiga!`,
        badgeColor: 'rose'
      }
    }

    if (mood === 'neutral') {
      return {
        mood: 'neutral',
        title: 'Zona de precaución financiera',
        message: `Vas por buen camino, pero tus gastos representan el ${Math.round((expenses / income) * 100 || 0)}% de tus ingresos. Intenta moderar un poco los egresos para estirar tu saldo (Bs. ${balance.toLocaleString('es-VE', { minimumFractionDigits: 2 })} disponible).`,
        badgeColor: 'amber'
      }
    }

    return {
      mood: 'happy',
      title: '¡Finanzas saludables!',
      message: `¡Excelente trabajo! Tus gastos están controlados y mantienes un balance positivo de Bs. ${balance.toLocaleString('es-VE', { minimumFractionDigits: 2 })}. ¡Sigue así, mi humano favorito!`,
      badgeColor: 'emerald'
    }
  })

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const MAX_LIMIT = 999999999.99
    const parsedAmount = Number(transaction.amount)

    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > MAX_LIMIT) {
      throw new Error('El monto se encuentra fuera de los límites permitidos.')
    }

    const sanitizedAmount = Math.round(parsedAmount * 100) / 100

    const isOutflow = transaction.type === 'expense' || transaction.type === 'saving_contribution' || transaction.type === 'debt_payment'
    if (isOutflow && sanitizedAmount > totalBalance.value) {
      throw new Error(`Fondos insuficientes. Intentas registrar Bs. ${sanitizedAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })} pero tu saldo disponible es de Bs. ${totalBalance.value.toLocaleString('es-VE', { minimumFractionDigits: 2 })}.`)
    }

    let userId = 'local_user'
    try {
      userId = await getUserId()
    } catch (e) {
      // Si estamos offline, permitimos crear ID local temporal
    }

    const tempId = 'local_tx_' + Date.now()
    const newTxPayload = {
      user_id: userId,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description,
      amount: sanitizedAmount,
      date: new Date().toISOString(),
      savings_goal_id: transaction.savingsGoalId || null,
      debt_goal_id: transaction.debtGoalId || null
    }

    let transactionId = tempId
    let finalDate = newTxPayload.date

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([newTxPayload])
        .select()
        .single()

      if (error) throw error
      if (data) {
        transactionId = data.id
        finalDate = data.date
      }
    } catch (error) {
      console.log('Modo offline: Transacción guardada localmente.')
    }

    const newTransaction: Transaction = {
      id: transactionId,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description,
      amount: sanitizedAmount,
      date: finalDate,
      savingsGoalId: transaction.savingsGoalId || undefined,
      debtGoalId: transaction.debtGoalId || undefined
    }

    transactions.value.unshift(newTransaction)
    saveToLocalStorage()
    return newTransaction.id
  }

  const deleteTransaction = async (id: string) => {
    const transaction = transactions.value.find((t) => t.id === id)
    if (!transaction) return

    if (transaction.type === 'saving_contribution' && transaction.savingsGoalId) {
      const contribution = savingContributions.value.find((c) => c.transactionId === id)
      const goal = savingGoals.value.find((g) => g.id === transaction.savingsGoalId)
      
      if (goal && contribution) {
        const newCurrent = Math.max(0, goal.currentAmount - contribution.amount)
        const newCompleted = newCurrent >= goal.targetAmount ? goal.isCompleted : false

        try {
          await supabase
            .from('saving_goals')
            .update({ current_amount: newCurrent, is_completed: newCompleted })
            .eq('id', goal.id)
        } catch (e) {}

        goal.currentAmount = newCurrent
        goal.isCompleted = newCompleted
      }
      try {
        await supabase.from('saving_contributions').delete().eq('transaction_id', id)
      } catch (e) {}
      savingContributions.value = savingContributions.value.filter((c) => c.transactionId !== id)
    }

    if (transaction.type === 'debt_payment' && transaction.debtGoalId) {
      const payment = debtPayments.value.find((p) => p.transactionId === id)
      const debt = debtGoals.value.find((d) => d.id === transaction.debtGoalId)

      if (debt && payment) {
        const newRemaining = Math.min(debt.totalAmount, debt.remainingAmount + payment.amount)
        const newPaidOff = newRemaining <= 0

        try {
          await supabase
            .from('debt_goals')
            .update({ remaining_amount: newRemaining, is_paid_off: newPaidOff })
            .eq('id', debt.id)
        } catch (e) {}

        debt.remainingAmount = newRemaining
        debt.isPaidOff = newPaidOff
      }
      try {
        await supabase.from('debt_payments').delete().eq('transaction_id', id)
      } catch (e) {}
      debtPayments.value = debtPayments.value.filter((p) => p.transactionId !== id)
    }

    if (!id.startsWith('local_')) {
      try {
        await supabase.from('transactions').delete().eq('id', id)
      } catch (e) {
        console.log('Modo offline: Eliminación pendiente de sincronizar.')
      }
    }

    transactions.value = transactions.value.filter((t) => t.id !== id)
    saveToLocalStorage()
  }

  const addSavingGoal = async (goal: Omit<SavingGoal, 'id' | 'currentAmount' | 'isCompleted' | 'createdAt'>) => {
    let userId = 'local_user'
    try {
      userId = await getUserId()
    } catch (e) {}

    const tempId = 'local_goal_' + Date.now()
    const createdAt = new Date().toISOString()
    const payload = {
      user_id: userId,
      title: goal.title.trim(),
      target_amount: Number(goal.targetAmount),
      current_amount: 0,
      currency: goal.currency,
      is_completed: false,
      created_at: createdAt
    }

    let goalId = tempId
    try {
      const { data, error } = await supabase
        .from('saving_goals')
        .insert([payload])
        .select()
        .single()

      if (error) throw error
      if (data) goalId = data.id
    } catch (error) {
      console.log('Modo offline: Meta de ahorro guardada localmente.')
    }

    const newGoal: SavingGoal = {
      id: goalId,
      title: goal.title.trim(),
      targetAmount: Number(goal.targetAmount),
      currentAmount: 0,
      currency: goal.currency,
      isCompleted: false,
      createdAt: createdAt
    }

    savingGoals.value.unshift(newGoal)
    saveToLocalStorage()
  }

  const deleteSavingGoal = async (goalId: string) => {
    const goal = savingGoals.value.find((g) => g.id === goalId)
    if (!goal) return

    try {
      await supabase.from('transactions').delete().eq('savings_goal_id', goalId)
      await supabase.from('saving_contributions').delete().eq('goal_id', goalId)
      await supabase.from('saving_goals').delete().eq('id', goalId)
    } catch (e) {
      console.log('Modo offline: Eliminación de meta de ahorro procesada localmente.')
    }

    transactions.value = transactions.value.filter((t) => t.savingsGoalId !== goalId)
    savingGoals.value = savingGoals.value.filter((g) => g.id !== goalId)
    savingContributions.value = savingContributions.value.filter((c) => c.goalId !== goalId)
    saveToLocalStorage()
  }

  const contributeToGoal = async (goalId: string, amountInBs: number, exchangeRate: number) => {
    let amountAddedInGoalCurrency = amountInBs
    const goal = savingGoals.value.find((g) => g.id === goalId)
    if (!goal) return

    if (goal.currency === 'USD') {
      amountAddedInGoalCurrency = exchangeRate > 0 ? amountInBs / exchangeRate : 0
    }

    amountAddedInGoalCurrency = Math.round(amountAddedInGoalCurrency * 100) / 100
    const baseCurrencyDeduction = Math.round(amountInBs * 100) / 100

    if (baseCurrencyDeduction > totalBalance.value) {
      throw new Error(`Saldo insuficiente para este aporte. Saldo actual: Bs. ${totalBalance.value.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`)
    }

    const newCurrentAmount = Math.min(goal.targetAmount, goal.currentAmount + amountAddedInGoalCurrency)
    const isCompleted = newCurrentAmount >= goal.targetAmount

    try {
      await supabase
        .from('saving_goals')
        .update({ current_amount: newCurrentAmount, is_completed: isCompleted })
        .eq('id', goalId)
    } catch (e) {}

    goal.currentAmount = newCurrentAmount
    goal.isCompleted = isCompleted

    const txId = await addTransaction({
      type: 'saving_contribution',
      category: 'Ahorros',
      description: `Aporte a ahorro: ${goal.title} (Bs. ${amountInBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })})`,
      amount: baseCurrencyDeduction,
      savingsGoalId: goalId
    })

    let userId = 'local_user'
    try {
      userId = await getUserId()
    } catch (e) {}

    const contribPayload = {
      user_id: userId,
      goal_id: goalId,
      amount: amountAddedInGoalCurrency,
      amount_in_base_currency: baseCurrencyDeduction,
      date: new Date().toISOString(),
      transaction_id: txId
    }

    let contribId = 'local_contrib_' + Date.now()
    try {
      const { data, error } = await supabase
        .from('saving_contributions')
        .insert([contribPayload])
        .select()
        .single()

      if (error) throw error
      if (data) contribId = data.id
    } catch (error) {}

    const newContribution: SavingContribution = {
      id: contribId,
      goalId: goalId,
      amount: amountAddedInGoalCurrency,
      amountInBaseCurrency: baseCurrencyDeduction,
      date: contribPayload.date,
      transactionId: txId
    }
    savingContributions.value.unshift(newContribution)
    saveToLocalStorage()
  }

  const deleteSavingContribution = async (contributionId: string) => {
    const contribution = savingContributions.value.find((c) => c.id === contributionId)
    if (!contribution) return

    if (contribution.transactionId) {
      await deleteTransaction(contribution.transactionId)
    } else {
      const goal = savingGoals.value.find((g) => g.id === contribution.goalId)
      if (goal) {
        goal.currentAmount = Math.max(0, goal.currentAmount - contribution.amount)
        if (goal.currentAmount < goal.targetAmount) {
          goal.isCompleted = false
        }
        try {
          await supabase
            .from('saving_goals')
            .update({ current_amount: goal.currentAmount, is_completed: goal.isCompleted })
            .eq('id', goal.id)
        } catch (e) {}
      }
      try {
        await supabase.from('saving_contributions').delete().eq('id', contributionId)
      } catch (e) {}
      savingContributions.value = savingContributions.value.filter((c) => c.id !== contributionId)
      saveToLocalStorage()
    }
  }

  const addDebtGoal = async (debt: Omit<DebtGoal, 'id' | 'remainingAmount' | 'isPaidOff' | 'createdAt'>) => {
    let userId = 'local_user'
    try {
      userId = await getUserId()
    } catch (e) {}

    const tempId = 'local_debt_' + Date.now()
    const createdAt = new Date().toISOString()
    const payload = {
      user_id: userId,
      title: debt.title.trim(),
      total_amount: Number(debt.totalAmount),
      remaining_amount: Number(debt.totalAmount),
      currency: debt.currency,
      is_paid_off: false,
      created_at: createdAt
    }

    let debtId = tempId
    try {
      const { data, error } = await supabase
        .from('debt_goals')
        .insert([payload])
        .select()
        .single()

      if (error) throw error
      if (data) debtId = data.id
    } catch (error) {}

    const newDebt: DebtGoal = {
      id: debtId,
      title: debt.title.trim(),
      totalAmount: Number(debt.totalAmount),
      remainingAmount: Number(debt.totalAmount),
      currency: debt.currency,
      isPaidOff: false,
      createdAt: createdAt
    }
    debtGoals.value.unshift(newDebt)
    saveToLocalStorage()
  }

  const payDebt = async (debtId: string, amountInBs: number, exchangeRate: number) => {
    let amountReducedInDebtCurrency = amountInBs
    const debt = debtGoals.value.find((d) => d.id === debtId)
    if (!debt) return

    if (debt.currency === 'USD') {
      amountReducedInDebtCurrency = exchangeRate > 0 ? amountInBs / exchangeRate : 0
    }

    amountReducedInDebtCurrency = Math.round(amountReducedInDebtCurrency * 100) / 100
    const baseCurrencyDeduction = Math.round(amountInBs * 100) / 100

    if (baseCurrencyDeduction > totalBalance.value) {
      throw new Error(`Saldo insuficiente para realizar este pago. Saldo actual: Bs. ${totalBalance.value.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`)
    }

    const newRemainingAmount = Math.max(0, debt.remainingAmount - amountReducedInDebtCurrency)
    const isPaidOff = newRemainingAmount === 0

    try {
      await supabase
        .from('debt_goals')
        .update({ remaining_amount: newRemainingAmount, is_paid_off: isPaidOff })
        .eq('id', debtId)
    } catch (e) {}

    debt.remainingAmount = newRemainingAmount
    debt.isPaidOff = isPaidOff

    const txId = await addTransaction({
      type: 'debt_payment',
      category: 'Deudas',
      description: `Pago de deuda: ${debt.title} (Bs. ${amountInBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })})`,
      amount: baseCurrencyDeduction,
      debtGoalId: debtId
    })

    let userId = 'local_user'
    try {
      userId = await getUserId()
    } catch (e) {}

    const paymentPayload = {
      user_id: userId,
      debt_id: debtId,
      amount: amountReducedInDebtCurrency,
      amount_in_base_currency: baseCurrencyDeduction,
      date: new Date().toISOString(),
      transaction_id: txId
    }

    let paymentId = 'local_pay_' + Date.now()
    try {
      const { data, error } = await supabase
        .from('debt_payments')
        .insert([paymentPayload])
        .select()
        .single()

      if (error) throw error
      if (data) paymentId = data.id
    } catch (error) {}

    const newPayment: DebtPayment = {
      id: paymentId,
      debtId: debtId,
      amount: amountReducedInDebtCurrency,
      amountInBaseCurrency: baseCurrencyDeduction,
      date: paymentPayload.date,
      transactionId: txId
    }
    debtPayments.value.unshift(newPayment)
    saveToLocalStorage()
  }

  const deleteDebtPayment = async (paymentId: string) => {
    const payment = debtPayments.value.find((p) => p.id === paymentId)
    if (!payment) return

    if (payment.transactionId) {
      await deleteTransaction(payment.transactionId)
    } else {
      const debt = debtGoals.value.find((d) => d.id === payment.debtId)
      if (debt) {
        debt.remainingAmount = Math.min(debt.totalAmount, debt.remainingAmount + payment.amount)
        if (debt.remainingAmount > 0) {
          debt.isPaidOff = false
        }
        try {
          await supabase
            .from('debt_goals')
            .update({ remaining_amount: debt.remainingAmount, is_paid_off: debt.isPaidOff })
            .eq('id', debt.id)
        } catch (e) {}
      }
      try {
        await supabase.from('debt_payments').delete().eq('id', paymentId)
      } catch (e) {}
      debtPayments.value = debtPayments.value.filter((p) => p.id !== paymentId)
      saveToLocalStorage()
    }
  }

  const deleteDebtGoal = async (debtId: string) => {
    try {
      await supabase.from('transactions').delete().eq('debt_goal_id', debtId)
      await supabase.from('debt_payments').delete().eq('debt_id', debtId)
      await supabase.from('debt_goals').delete().eq('id', debtId)
    } catch (e) {}

    transactions.value = transactions.value.filter((t) => t.debtGoalId !== debtId)
    debtGoals.value = debtGoals.value.filter((d) => d.id !== debtId)
    debtPayments.value = debtPayments.value.filter((p) => p.debtId !== debtId)
    saveToLocalStorage()
  }

  const resetAllData = async () => {
    try {
      const userId = await getUserId()
      await Promise.all([
        supabase.from('transactions').delete().eq('user_id', userId),
        supabase.from('saving_goals').delete().eq('user_id', userId),
        supabase.from('saving_contributions').delete().eq('user_id', userId),
        supabase.from('debt_goals').delete().eq('user_id', userId),
        supabase.from('debt_payments').delete().eq('user_id', userId)
      ])
    } catch (e) {}

    transactions.value = []
    savingGoals.value = []
    savingContributions.value = []
    debtGoals.value = []
    debtPayments.value = []
    localStorage.clear()
  }

  // Cargar datos de respaldo local al iniciar la store
  loadFromLocalStorage()

  return {
    transactions,
    savingGoals,
    savingContributions,
    debtGoals,
    debtPayments,
    isLoading,
    fetchAllData,
    totalIncome,
    totalExpense,
    totalBalance,
    totalSavingsAccumulated,
    totalDebtRemaining,
    petMood,
    financialAdvice,
    addTransaction,
    deleteTransaction,
    addSavingGoal,
    deleteSavingGoal,
    contributeToGoal,
    deleteSavingContribution,
    addDebtGoal,
    payDebt,
    deleteDebtPayment,
    deleteDebtGoal,
    resetAllData
  }
})