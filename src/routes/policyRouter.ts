import { Router } from 'express'
import { handlePolicyRequest } from '../services/policyRouterService.js'

export const router = Router()
router.post('/', handlePolicyRequest)
