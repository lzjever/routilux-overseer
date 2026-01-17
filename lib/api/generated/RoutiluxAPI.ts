/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { AxiosHttpRequest } from './core/AxiosHttpRequest';
import { BreakpointsService } from './services/BreakpointsService';
import { DebugService } from './services/DebugService';
import { DefaultService } from './services/DefaultService';
import { DiscoveryService } from './services/DiscoveryService';
import { FlowsService } from './services/FlowsService';
import { JobsService } from './services/JobsService';
import { MonitorService } from './services/MonitorService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class RoutiluxAPI {
    public readonly breakpoints: BreakpointsService;
    public readonly debug: DebugService;
    public readonly default: DefaultService;
    public readonly discovery: DiscoveryService;
    public readonly flows: FlowsService;
    public readonly jobs: JobsService;
    public readonly monitor: MonitorService;
    public readonly request: BaseHttpRequest;
    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = AxiosHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? '',
            VERSION: config?.VERSION ?? '0.10.0',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });
        this.breakpoints = new BreakpointsService(this.request);
        this.debug = new DebugService(this.request);
        this.default = new DefaultService(this.request);
        this.discovery = new DiscoveryService(this.request);
        this.flows = new FlowsService(this.request);
        this.jobs = new JobsService(this.request);
        this.monitor = new MonitorService(this.request);
    }
}

