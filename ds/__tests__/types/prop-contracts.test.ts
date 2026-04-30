/**
 * Prop signature contract tests.
 *
 * These run as regular Vitest tests but the assertions are compile-time —
 * `expectTypeOf` only fails to type-check if a contract is broken, and the
 * runtime body is a no-op. So if `tsc` accepts this file, the contract holds.
 *
 * Coverage: top-10 most-used components (Button, Input, Card, Modal, Alert,
 * Select, Tabs, Drawer, Toast, Form). Each suite asserts 4–6 key props.
 */
import { describe, it } from "vitest";
import { expectTypeOf } from "expect-type";
import type { ReactNode } from "react";

import type { ButtonProps, ButtonVariant, ButtonSize } from "../../primitives/Button";
import type { InputProps, InputSize } from "../../primitives/Input";
import type { CardProps } from "../../composites/Card";
import type {
  ModalProps,
  ModalSize,
  ModalHeaderProps,
} from "../../composites/Modal";
import type { AlertProps, AlertVariant } from "../../composites/Alert";
import type { SelectProps, SelectOption } from "../../composites/Select";
import type { TabsProps, Tab } from "../../composites/Tabs";
import type {
  DrawerProps,
  DrawerSide,
  DrawerSize,
} from "../../composites/Drawer";
import type {
  ToastProviderProps,
  ToastType,
  ToastPosition,
} from "../../composites/Toast";
import type { FormProps } from "../../patterns/Form";

describe("prop signature contracts", () => {
  it("Button props remain stable", () => {
    expectTypeOf<ButtonProps>().toHaveProperty("variant");
    expectTypeOf<ButtonProps>().toHaveProperty("size");
    expectTypeOf<ButtonProps>().toHaveProperty("loading");
    expectTypeOf<ButtonProps>().toHaveProperty("fullWidth");
    expectTypeOf<ButtonProps["loading"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<ButtonProps["fullWidth"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<ButtonVariant>().toEqualTypeOf<
      "primary" | "secondary" | "danger" | "ghost" | "outline" | "link"
    >();
    expectTypeOf<ButtonSize>().toEqualTypeOf<"xs" | "sm" | "md" | "lg">();
  });

  it("Input props remain stable", () => {
    expectTypeOf<InputProps>().toHaveProperty("size");
    expectTypeOf<InputProps>().toHaveProperty("error");
    expectTypeOf<InputProps>().toHaveProperty("leftSlot");
    expectTypeOf<InputProps>().toHaveProperty("rightSlot");
    expectTypeOf<InputProps["error"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<InputProps["placeholder"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<InputSize>().toEqualTypeOf<"sm" | "md" | "lg">();
  });

  it("Card props remain stable", () => {
    expectTypeOf<CardProps>().toHaveProperty("hoverable");
    expectTypeOf<CardProps>().toHaveProperty("noPadding");
    expectTypeOf<CardProps>().toHaveProperty("className");
    expectTypeOf<CardProps["hoverable"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<CardProps["noPadding"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<CardProps["className"]>().toEqualTypeOf<string | undefined>();
  });

  it("Modal props remain stable", () => {
    expectTypeOf<ModalProps>().toHaveProperty("open");
    expectTypeOf<ModalProps>().toHaveProperty("onClose");
    expectTypeOf<ModalProps>().toHaveProperty("size");
    expectTypeOf<ModalProps>().toHaveProperty("dismissible");
    expectTypeOf<ModalProps["open"]>().toEqualTypeOf<boolean>();
    expectTypeOf<ModalProps["onClose"]>().toEqualTypeOf<() => void>();
    expectTypeOf<ModalProps["dismissible"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<ModalSize>().toEqualTypeOf<"sm" | "md" | "lg" | "xl" | "full">();
    expectTypeOf<ModalHeaderProps>().toHaveProperty("onClose");
  });

  it("Alert props remain stable", () => {
    expectTypeOf<AlertProps>().toHaveProperty("variant");
    expectTypeOf<AlertProps>().toHaveProperty("title");
    expectTypeOf<AlertProps>().toHaveProperty("icon");
    expectTypeOf<AlertProps>().toHaveProperty("onClose");
    expectTypeOf<AlertProps["title"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<AlertProps["onClose"]>().toEqualTypeOf<(() => void) | undefined>();
    expectTypeOf<AlertVariant>().toEqualTypeOf<
      "info" | "success" | "warning" | "danger"
    >();
  });

  it("Select props remain stable", () => {
    expectTypeOf<SelectProps>().toHaveProperty("options");
    expectTypeOf<SelectProps>().toHaveProperty("value");
    expectTypeOf<SelectProps>().toHaveProperty("onChange");
    expectTypeOf<SelectProps>().toHaveProperty("searchable");
    expectTypeOf<SelectProps>().toHaveProperty("disabled");
    expectTypeOf<SelectProps["options"]>().toEqualTypeOf<SelectOption<string>[]>();
    expectTypeOf<SelectProps["disabled"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<SelectOption>().toHaveProperty("value");
    expectTypeOf<SelectOption>().toHaveProperty("label");
  });

  it("Tabs props remain stable", () => {
    expectTypeOf<TabsProps>().toHaveProperty("tabs");
    expectTypeOf<TabsProps>().toHaveProperty("value");
    expectTypeOf<TabsProps>().toHaveProperty("onChange");
    expectTypeOf<TabsProps>().toHaveProperty("variant");
    expectTypeOf<TabsProps["value"]>().toEqualTypeOf<string>();
    expectTypeOf<TabsProps["onChange"]>().toEqualTypeOf<(value: string) => void>();
    expectTypeOf<TabsProps["variant"]>().toEqualTypeOf<
      "underline" | "pills" | "segment" | undefined
    >();
    expectTypeOf<Tab>().toHaveProperty("label");
  });

  it("Drawer props remain stable", () => {
    expectTypeOf<DrawerProps>().toHaveProperty("open");
    expectTypeOf<DrawerProps>().toHaveProperty("onClose");
    expectTypeOf<DrawerProps>().toHaveProperty("side");
    expectTypeOf<DrawerProps>().toHaveProperty("size");
    expectTypeOf<DrawerProps>().toHaveProperty("dismissible");
    expectTypeOf<DrawerProps["open"]>().toEqualTypeOf<boolean>();
    expectTypeOf<DrawerProps["onClose"]>().toEqualTypeOf<() => void>();
    expectTypeOf<DrawerSide>().toEqualTypeOf<"left" | "right" | "bottom">();
    expectTypeOf<DrawerSize>().toEqualTypeOf<"sm" | "md" | "lg" | "xl">();
  });

  it("Toast provider props remain stable", () => {
    expectTypeOf<ToastProviderProps>().toHaveProperty("children");
    expectTypeOf<ToastProviderProps>().toHaveProperty("position");
    expectTypeOf<ToastProviderProps>().toHaveProperty("maxToasts");
    expectTypeOf<ToastProviderProps["children"]>().toEqualTypeOf<ReactNode>();
    expectTypeOf<ToastProviderProps["maxToasts"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<ToastType>().toEqualTypeOf<
      "success" | "error" | "warning" | "info"
    >();
    expectTypeOf<ToastPosition>().toEqualTypeOf<
      "top-right" | "top-center" | "bottom-right" | "bottom-center"
    >();
  });

  it("Form props remain stable", () => {
    expectTypeOf<FormProps>().toHaveProperty("values");
    expectTypeOf<FormProps>().toHaveProperty("onChange");
    expectTypeOf<FormProps>().toHaveProperty("errors");
    expectTypeOf<FormProps>().toHaveProperty("touched");
    expectTypeOf<FormProps>().toHaveProperty("onSubmit");
    expectTypeOf<FormProps["values"]>().toEqualTypeOf<Record<string, unknown>>();
    expectTypeOf<FormProps["onChange"]>().toEqualTypeOf<
      (name: string, value: unknown) => void
    >();
    expectTypeOf<FormProps["onSubmit"]>().toEqualTypeOf<(() => void) | undefined>();
  });
});
