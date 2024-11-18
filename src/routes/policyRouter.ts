import { Router } from 'express'
import { handlePolicyRequest } from '../services/policyRouterService.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const router = Router()
router.post('/', asyncHandler(handlePolicyRequest))
