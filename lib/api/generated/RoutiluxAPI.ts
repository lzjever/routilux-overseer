/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { AxiosHttpRequest } from './core/AxiosHttpRequest';
import { OpenAPI } from './core/OpenAPI';
import { BreakpointsService } from './services/BreakpointsService';
import { DebugService } from './services/DebugService';
import { DefaultService } from './services/DefaultService';
import { DiscoveryService } from './services/DiscoveryService';
import { FlowsService } from './services/FlowsService';
import { JobsService } from './services/JobsService';
import { MonitorService } from './services/MonitorService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class RoutiluxAPI {
    public readonly breakpoints: typeof BreakpointsService;
    public readonly debug: typeof DebugService;
    public readonly default: typeof DefaultService;
    public readonly discovery: typeof DiscoveryService;
    public readonly flows: typeof FlowsService;
    public readonly jobs: typeof JobsService;
    public readonly monitor: typeof MonitorService;
    public readonly request: BaseHttpRequest;
    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = AxiosHttpRequest) {
        // Update global OpenAPI config
        if (config?.BASE !== undefined) {
            OpenAPI.BASE = config.BASE;
        }
        if (config?.VERSION !== undefined) {
            OpenAPI.VERSION = config.VERSION;
        }
        if (config?.WITH_CREDENTIALS !== undefined) {
            OpenAPI.WITH_CREDENTIALS = config.WITH_CREDENTIALS;
        }
        if (config?.CREDENTIALS !== undefined) {
            OpenAPI.CREDENTIALS = config.CREDENTIALS;
        }
        if (config?.TOKEN !== undefined) {
            OpenAPI.TOKEN = config.TOKEN;
        }
        if (config?.USERNAME !== undefined) {
            OpenAPI.USERNAME = config.USERNAME;
        }
        if (config?.PASSWORD !== undefined) {
            OpenAPI.PASSWORD = config.PASSWORD;
        }
        if (config?.HEADERS !== undefined) {
            OpenAPI.HEADERS = config.HEADERS;
        }
        if (config?.ENCODE_PATH !== undefined) {
            OpenAPI.ENCODE_PATH = config.ENCODE_PATH;
        }
        
        // Create request instance for potential future use
        this.request = new HttpRequest({
            BASE: config?.BASE ?? OpenAPI.BASE,
            VERSION: config?.VERSION ?? OpenAPI.VERSION,
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? OpenAPI.WITH_CREDENTIALS,
            CREDENTIALS: config?.CREDENTIALS ?? OpenAPI.CREDENTIALS,
            TOKEN: config?.TOKEN ?? OpenAPI.TOKEN,
            USERNAME: config?.USERNAME ?? OpenAPI.USERNAME,
            PASSWORD: config?.PASSWORD ?? OpenAPI.PASSWORD,
            HEADERS: config?.HEADERS ?? OpenAPI.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH ?? OpenAPI.ENCODE_PATH,
        });
        
        // Expose service classes (they use static methods with global OpenAPI config)
        this.breakpoints = BreakpointsService;
        this.debug = DebugService;
        this.default = DefaultService;
        this.discovery = DiscoveryService;
        this.flows = FlowsService;
        this.jobs = JobsService;
        this.monitor = MonitorService;
    }
}

