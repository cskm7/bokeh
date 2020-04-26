import {Annotation, AnnotationView} from "./annotation"
import {Toolbar} from "../tools/toolbar"
import {ToolbarBaseView} from "../tools/toolbar_base"
import {build_view} from "core/build_views"
import {div, empty, position, display, undisplay, remove} from "core/dom"
import {Size} from "core/layout"
import * as p from "core/properties"

export class ToolbarPanelView extends AnnotationView {
  model: ToolbarPanel

  readonly rotate: boolean = true

  protected _toolbar_view: ToolbarBaseView
  protected toolbar_el: HTMLElement

  initialize(): void {
    super.initialize()
    this.toolbar_el = div()
    this.plot_view.canvas_view.add_event(this.toolbar_el)
  }

  async lazy_initialize(): Promise<void> {
    this._toolbar_view = await build_view(this.model.toolbar, {parent: this}) as ToolbarBaseView
    this.plot_view.visibility_callbacks.push((visible) => this._toolbar_view.set_visibility(visible))
  }

  remove(): void {
    this._toolbar_view.remove()
    remove(this.toolbar_el)
    super.remove()
  }

  render(): void {
    super.render()
    if (!this.model.visible) {
      undisplay(this.toolbar_el)
      return
    }

    this.toolbar_el.style.position = "absolute"
    this.toolbar_el.style.overflow = "hidden"

    position(this.toolbar_el, this.panel!.bbox)
    this._toolbar_view.render()
    empty(this.toolbar_el)
    this.toolbar_el.appendChild(this._toolbar_view.el)
    display(this.toolbar_el)
  }

  protected _get_size(): Size {
    const {tools, logo} = this.model.toolbar
    return {
      width: tools.length*30 + (logo != null ? 25 : 0), // TODO: approximate, use a proper layout instead.
      height: 30,
    }
  }
}

export namespace ToolbarPanel {
  export type Attrs = p.AttrsOf<Props>

  export type Props = Annotation.Props & {
    toolbar: p.Property<Toolbar>
  }
}

export interface ToolbarPanel extends ToolbarPanel.Attrs {}

export class ToolbarPanel extends Annotation {
  properties: ToolbarPanel.Props
  __view_type__: ToolbarPanelView

  constructor(attrs?: Partial<ToolbarPanel.Attrs>) {
    super(attrs)
  }

  static init_ToolbarPanel(): void {
    this.prototype.default_view = ToolbarPanelView

    this.define<ToolbarPanel.Props>({
      toolbar: [ p.Instance ],
    })
  }
}
