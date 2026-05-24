/**
 * Pre-typed Redux Hooks
 * Use these instead of plain useDispatch and useSelector
 */

import type { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector = <Selected>(
  selector: (state: RootState) => Selected,
): Selected => useSelector(selector);
